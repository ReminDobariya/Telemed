const express = require('express');
const { body, validationResult } = require('express-validator');
const Health = require('../models/Health');
const Profile = require('../models/Profile');
const Medication = require('../models/Medication');
const Allergy = require('../models/Allergy');
const Prescription = require('../models/Prescription');
const Conversation = require('../models/Conversation');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const geminiServiceModule = require('../services/geminiService');

const router = express.Router();

// Simple in-memory cache for insights per user
// { [userId]: { signature: string, insights: string[], cachedAt: number } }
const insightsCache = new Map();

function auth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.sub;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

router.get('/overview', auth, (req, res) => {
  Health.findOne({ userId: req.userId }).then(doc => {
    const data = doc || { vitals: [], reports: [] };
    res.json({ success: true, health: data });
  }).catch(() => res.status(500).json({ success: false, error: 'Failed to load health' }));
});

router.post('/vitals', auth, [
  body('type').isString(),
  body('value').isString(),
  body('unit').optional().isString()
], validate, (req, res) => {
  Health.findOneAndUpdate(
    { userId: req.userId },
    { $push: { vitals: { type: req.body.type, value: req.body.value, unit: req.body.unit, timestamp: new Date() } } },
    { new: true, upsert: true }
  ).then(doc => {
    const vital = doc.vitals[doc.vitals.length - 1];
    res.json({ success: true, vital });
  }).catch(() => res.status(500).json({ success: false, error: 'Failed to add vital' }));
});

// Patient upload health report (unstructured)
router.post('/reports/upload', auth, [
  body('reportDate').optional().isISO8601(),
  body('testType').isString().notEmpty().withMessage('Test type required'),
  body('fileUrl').optional().isString(),
  body('labName').optional().isString(),
  body('patientNotes').optional().isString(),
], validate, async (req, res) => {
  try {
    const { reportDate, testType, fileUrl, labName, patientNotes } = req.body;
    
    const report = {
      type: 'unstructured',
      testType,
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      fileUrl,
      labName,
      patientNotes,
      verifiedByDoctor: false,
      createdAt: new Date(),
    };
    
    await Health.findOneAndUpdate(
      { userId: req.userId },
      { $push: { reports: report } },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Failed to upload health report:', error);
    res.status(500).json({ success: false, error: 'Failed to upload health report' });
  }
});

// Doctor create structured health report
router.post('/reports/structured', auth, [
  body('testType').isString().notEmpty().withMessage('Test type required'),
  body('reportName').isString().notEmpty().withMessage('Report name required'),
  body('userId').isMongoId().withMessage('Patient ID required'),
  body('findings').optional().isString(),
  body('summary').optional().isString(),
  body('recommendations').optional().isString(),
  body('fileUrl').optional().isString(),
], validate, async (req, res) => {
  try {
    // Verify this is a doctor (you may need to add doctor auth middleware)
    const jwt = require('jsonwebtoken');
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    
    if (decoded.role !== 'doctor') {
      return res.status(403).json({ success: false, error: 'Doctor access required' });
    }
    
    const { userId, testType, reportName, findings, summary, recommendations, fileUrl } = req.body;
    
    const report = {
      type: 'structured',
      uploaderId: decoded.sub,
      uploaderType: 'Doctor',
      testType,
      reportName,
      findings,
      summary,
      recommendations,
      fileUrl,
      verifiedByDoctor: true,
      verifiedBy: decoded.sub,
      createdAt: new Date(),
    };
    
    await Health.findOneAndUpdate(
      { userId },
      { $push: { reports: report } },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Failed to create structured health report:', error);
    res.status(500).json({ success: false, error: 'Failed to create health report' });
  }
});

router.get('/insights', auth, async (req, res) => {
  try {
    // Collect all user health data
    const [profile, medications, allergies, prescriptions, health, conversations] = await Promise.all([
      Profile.findOne({ userId: req.userId }).lean(),
      Medication.find({ userId: req.userId }).lean(),
      Allergy.find({ userId: req.userId }).lean(),
      Prescription.find({ userId: req.userId }).lean(),
      Health.findOne({ userId: req.userId }).lean(),
      Conversation.find({ userId: req.userId }).sort({ updatedAt: -1 }).limit(5).lean(),
    ]);

    // Build context for AI
    const healthContext = {
      profile: profile || {},
      medications: medications || [],
      allergies: allergies || [],
      prescriptions: prescriptions || [],
      vitals: health?.vitals || [],
      reports: health?.reports || [],
      recentChats: (conversations || []).map(c => ({
        title: c.title,
        lastMessage: c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].content.substring(0, 200) : ''
      })),
      recentChatsFull: (conversations || []).map(c => ({
        title: c.title,
        messages: (c.messages || []).slice(-10).map(m => ({ role: m.role, content: m.content })).reverse(),
      })),
    };

    // Build a signature from counts and latest timestamps to detect changes
    const signature = JSON.stringify({
      p: profile?.updatedAt || null,
      pCount: medications?.length || 0,
      m: (medications || []).map(x => ({ id: String(x._id), updatedAt: x.updatedAt })).sort((a, b) => String(a.id).localeCompare(String(b.id))),
      aCount: allergies?.length || 0,
      a: (allergies || []).map(x => ({ id: String(x._id), updatedAt: x.updatedAt })).sort((a, b) => String(a.id).localeCompare(String(b.id))),
      rxCount: prescriptions?.length || 0,
      rx: (prescriptions || []).map(x => ({ id: String(x._id), updatedAt: x.updatedAt })).sort((a, b) => String(a.id).localeCompare(String(b.id))),
      h: health?.updatedAt || null,
      vCount: (health?.vitals || []).length,
      v: (health?.vitals || []).slice(-5).map(x => x.timestamp).sort(),
      rCount: (health?.reports || []).length,
      cCount: conversations?.length || 0,
      c: (conversations || []).map(x => ({ id: String(x._id), updatedAt: x.updatedAt })).sort((a, b) => String(a.id).localeCompare(String(b.id))),
    })

    // Return cached insights if signature unchanged
    const cached = insightsCache.get(req.userId)
    if (cached && cached.signature === signature) {
      return res.json({ success: true, insights: cached.insights, signature })
    }

    // Prepare prompt for Gemini
    const prompt = `You are a health insights assistant. Based on the following user health data, generate 3-5 short, helpful health insights.

IMPORTANT GUIDELINES:
- Keep insights simple, friendly, and easy to understand
- Use medically safe language - do NOT diagnose or prescribe
- Avoid technical medical jargon
- Do NOT make claims about curing, diagnosing, or confirming diseases
- Focus on general wellness suggestions and awareness
- Be encouraging and supportive

User Health Data:
${JSON.stringify(healthContext, null, 2)}

Generate 3-5 insights as a simple bulleted list. Each insight should be one short sentence (max 2 sentences). Make them relevant to the user's actual data. If data is limited, provide general wellness tips.

Format your response as a simple list, one insight per line, starting with "- ".`;

    const geminiService = geminiServiceModule.getInstance();
    
    // Use Gemini to generate insights
    const result = await geminiService.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse insights from response
    const insights = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('- ') || line.startsWith('•') || line.match(/^\d+\./))
      .map(line => line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5);

    // Fallback if AI didn't return proper format
    if (insights.length === 0) {
      insights.push(
        "Keep track of your health metrics regularly to maintain awareness of your wellness.",
        "Don't hesitate to reach out to healthcare providers when you have questions or concerns.",
        "Small, consistent lifestyle choices can make a positive difference in your overall health."
      );
    }

    // Save to cache
    insightsCache.set(req.userId, { signature, insights, cachedAt: Date.now() })

    res.json({ success: true, insights, signature });
  } catch (error) {
    console.error('Failed to generate health insights:', error);
    // Return fallback insights on error
    res.json({
      success: true,
      insights: [
        "Regular monitoring of your health metrics helps you stay informed about your wellness.",
        "Maintain open communication with your healthcare providers about any concerns.",
        "Consistent lifestyle habits support your overall health and well-being."
      ]
    });
  }
});

module.exports = router;


