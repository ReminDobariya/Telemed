const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const geminiServiceModule = require('../services/geminiService');
const conversationServiceModule = require('../services/conversationService');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to the telemedicine chatbot
 * @access  Public
 */
router.post('/message', [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('conversationId').optional().isString(),
  body('userId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be between 1 and 100 characters'),
  body('languageCode')
    .optional()
    .isIn(['en', 'hi', 'gu', 'mr'])
    .withMessage('Language code must be en, hi, gu, or mr')
], validateRequest, async (req, res) => {
  try {
    let { message, conversationId, userId = 'anonymous', languageCode = 'en' } = req.body;
    const isValidUserId = userId && mongoose.Types.ObjectId.isValid(userId);
    userId = isValidUserId ? userId : undefined;

    // Validate message for medical appropriateness
    const geminiService = geminiServiceModule.getInstance();
    const validation = geminiService.validateMedicalMessage(message);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message content'
      });
    }

    // Check for emergency keywords
    if (validation.isEmergency) {
      return res.status(200).json({
        success: true,
        message: validation.warning,
        isEmergency: true,
        conversationId: conversationId || 'emergency',
        timestamp: new Date().toISOString()
      });
    }

    const conversationService = conversationServiceModule.getInstance();
    let conversation;
    
    // If no conversationId, create a persistent conversation in Mongo first
    if (!conversationId) {
      const doc = { messages: [] };
      if (userId) {
        doc.userId = userId;
      }
      const created = await Conversation.create(doc);
      conversationId = created._id.toString();
    }

    // Get or create in-memory conversation mirror (using Mongo _id as key)
    if (conversationId) {
      conversation = conversationService.getConversation(conversationId);
      if (!conversation) {
        // If conversation doesn't exist, create a new one with the provided ID
        conversation = conversationService.createConversation(userId, conversationId);
      }
    }

    // Add user message to conversation
    conversationService.addMessage(conversation.id, 'user', message);

    // Persist user message and auto-generate title if this is the first message
    try {
      const conv = await Conversation.findById(conversationId);
      const isFirstMessage = !conv || !conv.messages || conv.messages.length === 0;
      
      const update = { 
        $push: { messages: { role: 'user', content: message, timestamp: new Date() } }
      };
      if (userId) {
        update.$set = { userId };
      }
      await Conversation.findByIdAndUpdate(conversationId, update, { upsert: true });
      
      // Auto-generate title from first message if no title exists
      if (isFirstMessage) {
        const title = message.trim().slice(0, 50).replace(/\n/g, ' ') || 'New chat';
        await Conversation.findByIdAndUpdate(conversationId, { $set: { title } });
      }
    } catch (e) {
      console.error('Failed to persist user message', e.message);
    }

    // Get conversation history for context
    const conversationHistory = conversation.messages.slice(-10); // Last 10 messages for context

    // Generate AI response
    const aiResponse = await geminiService.generateResponse(message, conversationHistory, languageCode);

    // Add AI response to conversation
    conversationService.addMessage(conversation.id, 'assistant', aiResponse.message, {
      model: aiResponse.model,
      conversationId: aiResponse.conversationId
    });

    // Persist assistant message
    try {
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $push: { messages: { role: 'assistant', content: aiResponse.message, timestamp: new Date() } } }
      );
    } catch (e) {
      console.error('Failed to persist assistant message', e.message);
    }

    res.status(200).json({
      success: true,
      message: aiResponse.message,
      conversationId: conversation.id,
      timestamp: aiResponse.timestamp,
      isEmergency: false
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message. Please try again.'
    });
  }
});

/**
 * @route   POST /api/chat/upload-image
 * @desc    Upload an image for medical analysis
 * @access  Public
 */
router.post('/upload-image', upload.single('image'), [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('conversationId').optional().isString(),
  body('userId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be between 1 and 100 characters'),
  body('languageCode')
    .optional()
    .isIn(['en', 'hi', 'gu', 'mr'])
    .withMessage('Language code must be en, hi, gu, or mr')
], validateRequest, async (req, res) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    let { message, conversationId, userId = 'anonymous', languageCode = 'en' } = req.body;
    const isValidUserId = userId && mongoose.Types.ObjectId.isValid(userId);
    userId = isValidUserId ? userId : undefined;
    const imageBuffer = req.file.buffer;

    // Validate message for medical appropriateness
    const geminiService = geminiServiceModule.getInstance();
    const validation = geminiService.validateMedicalMessage(message);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message content'
      });
    }

    const conversationService = conversationServiceModule.getInstance();
    let conversation;
    
    // Ensure we have a persistent Mongo conversation id
    if (!conversationId) {
      const doc = { messages: [] };
      if (userId) {
        doc.userId = userId;
      }
      const created = await Conversation.create(doc);
      conversationId = created._id.toString();
    }

    // Get or create in-memory mirror
    if (conversationId) {
      conversation = conversationService.getConversation(conversationId);
      if (!conversation) {
        conversation = conversationService.createConversation(userId, conversationId);
      }
    }

    // Add user message to conversation
    conversationService.addMessage(conversation.id, 'user', message, {
      hasImage: true,
      imageSize: imageBuffer.length,
      imageType: req.file.mimetype
    });

    // Persist user message and auto-generate title if this is the first message
    try {
      const conv = await Conversation.findById(conversationId);
      const isFirstMessage = !conv || !conv.messages || conv.messages.length === 0;
      
      const update = {
        $push: { messages: { role: 'user', content: message, timestamp: new Date(), metadata: { hasImage: true } } }
      };
      if (userId) {
        update.$set = { userId };
      }
      await Conversation.findByIdAndUpdate(conversationId, update, { upsert: true });
      
      // Auto-generate title from first message if no title exists
      if (isFirstMessage) {
        const title = message.trim().slice(0, 50).replace(/\n/g, ' ') || 'New chat';
        await Conversation.findByIdAndUpdate(conversationId, { $set: { title } });
      }
    } catch (e) {
      console.error('Failed to persist user image message', e.message);
    }

    // Get conversation history for context
    const conversationHistory = conversation.messages.slice(-10);

  // 1) Call external Flask skin classifier
  let classifier = null;
  try {
    const form = new FormData();
    form.append('image', req.file.buffer, { filename: req.file.originalname || 'image.jpg', contentType: req.file.mimetype });
    const flaskUrl = process.env.SKIN_MODEL_URL || 'http://127.0.0.1:5000/predict';
    const clfResp = await axios.post(flaskUrl, form, { headers: form.getHeaders(), timeout: 20000 });
    classifier = {
      predictedDisease: clfResp.data?.predicted_disease,
      confidence: clfResp.data?.confidence,
    };
  } catch (e) {
    console.error('Skin model call failed:', e?.response?.data || e.message);
  }

  // 2) Build empathetic explanation prompt infused with classifier info
  const hasClassifier = classifier && classifier.predictedDisease && typeof classifier.confidence === 'number';
  const userMsg = message || 'Photo uploaded for skin concern';
  const summaryPrompt = hasClassifier
    ? `Based on your photo and the external classifier, it might be "${classifier.predictedDisease}" (confidence: ${classifier.confidence}%).\n\nPlease respond in friendly, simple language with:\n- A short summary of what ${classifier.predictedDisease} might be (mention confidence ${classifier.confidence}%).\n- What it is and common symptoms.\n- Possible causes or risk factors.\n- Safe, simple home care tips (no medications).\n- When to see a dermatologist.\n- End with: "I’m not a doctor — this is just general information. Please consult a healthcare professional for an accurate diagnosis and treatment."\n\nUser said: "${userMsg}"`
    : `An external classifier is unavailable. The user uploaded a photo and said: "${userMsg}".\n\nPlease respond in friendly, simple language with:\n- A short summary of what the skin issue might be.\n- What it is and common symptoms.\n- Possible causes or risk factors.\n- Safe, simple home care tips (no medications).\n- When to see a dermatologist.\n- End with: "I’m not a doctor — this is just general information. Please consult a healthcare professional for an accurate diagnosis and treatment."`;

  // 3) Ask Gemini to produce the conversational response (still using the image as context)
  const aiResponse = await geminiService.analyzeImage(imageBuffer, summaryPrompt, conversationHistory, languageCode);

    // Add AI response to conversation
    conversationService.addMessage(conversation.id, 'assistant', aiResponse.message, {
      model: aiResponse.model,
      conversationId: aiResponse.conversationId,
      hasImageAnalysis: true
    });

    // Persist assistant message
    try {
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $push: { messages: { role: 'assistant', content: aiResponse.message, timestamp: new Date(), metadata: { hasImageAnalysis: true } } } }
      );
    } catch (e) {
      console.error('Failed to persist assistant image message', e.message);
    }

  res.status(200).json({
      success: true,
      message: aiResponse.message,
      conversationId: conversation.id,
      timestamp: aiResponse.timestamp,
    hasImageAnalysis: true,
    classifier: hasClassifier ? classifier : null
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process image. Please try again.'
    });
  }
});

/**
 * @route   GET /api/chat/conversations/:userId
 * @desc    Get all conversations for a user
 * @access  Public
 */
router.get('/conversations/:userId', [
  param('userId')
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid user ID')
], validateRequest, async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationService = conversationServiceModule.getInstance();
    const conversations = conversationService.getUserConversations(userId);

    res.status(200).json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        status: conv.status,
        messageCount: conv.messages.length
      }))
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversations'
    });
  }
});

/**
 * @route   GET /api/chat/conversation/:conversationId
 * @desc    Get a specific conversation with messages
 * @access  Public
 */
router.get('/conversation/:conversationId', [
  param('conversationId')
    .isUUID()
    .withMessage('Invalid conversation ID format')
], validateRequest, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversationService = conversationServiceModule.getInstance();
    const conversation = conversationService.getConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      conversation: {
        id: conversation.id,
        userId: conversation.userId,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        status: conversation.status,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata
        }))
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation'
    });
  }
});

/**
 * @route   PUT /api/chat/conversation/:conversationId/status
 * @desc    Update conversation status
 * @access  Public
 */
router.put('/conversation/:conversationId/status', [
  param('conversationId')
    .isUUID()
    .withMessage('Invalid conversation ID format'),
  body('status')
    .isIn(['active', 'completed', 'archived'])
    .withMessage('Status must be active, completed, or archived')
], validateRequest, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;
    const conversationService = conversationServiceModule.getInstance();

    const conversation = conversationService.updateConversationStatus(conversationId, status);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      conversation: {
        id: conversation.id,
        status: conversation.status,
        updatedAt: conversation.updatedAt
      }
    });

  } catch (error) {
    console.error('Update conversation status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation status'
    });
  }
});

/**
 * @route   GET /api/chat/conversation/:conversationId/stats
 * @desc    Get conversation statistics
 * @access  Public
 */
router.get('/conversation/:conversationId/stats', [
  param('conversationId')
    .isUUID()
    .withMessage('Invalid conversation ID format')
], validateRequest, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversationService = conversationServiceModule.getInstance();
    const stats = conversationService.getConversationStats(conversationId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get conversation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation statistics'
    });
  }
});

/**
 * @route   DELETE /api/chat/conversation/:conversationId
 * @desc    Delete a conversation
 * @access  Public
 */
router.delete('/conversation/:conversationId', [
  param('conversationId')
    .isUUID()
    .withMessage('Invalid conversation ID format')
], validateRequest, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversationService = conversationServiceModule.getInstance();
    const deleted = conversationService.deleteConversation(conversationId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    });
  }
});

module.exports = router;
