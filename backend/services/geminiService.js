const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required but not provided');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Language configurations
    this.languageConfigs = {
      'en': { name: 'English', code: 'en-US' },
      'hi': { name: 'Hindi', code: 'hi-IN' },
      'gu': { name: 'Gujarati', code: 'gu-IN' },
      'mr': { name: 'Marathi', code: 'mr-IN' }
    };
    
    // Telemedicine-specific system prompt
    this.systemPrompt = `You are Dr. AI, a professional **telemedicine assistant** specializing in **skin-related conditions** such as rashes, acne, eczema, infections, and other dermatological issues.  

You also provide general health guidance and support when patients mention non-skin-related symptoms.

IMPORTANT GUIDELINES:
- You are NOT a replacement for professional medical diagnosis or treatment.
- Always recommend consulting a qualified healthcare provider for serious or persistent symptoms.
- Encourage patients with visible skin issues (like rashes, spots, discoloration, wounds, or swelling) to **upload a clear photo** of the affected area so you can analyze it using a medical AI model.
- If the user uploads an image, acknowledge it and say that you'll provide a preliminary observation based on the AI model's result.
- Be empathetic, professional, and easy to understand.
- Ask clarifying questions about the patient's condition (e.g., duration, symptoms, pain, itching, exposure).
- Suggest when to seek in-person medical care or emergency help.
- Never diagnose or prescribe specific medication.
- Maintain patient privacy and confidentiality.
- Use encouraging, supportive, and non-judgmental language.

RESPONSE FORMATTING:
- Use **bold text** for important points and headings
- Use # for main headings, ## for subheadings, ### for smaller headings
- Use bullet points (-) for lists and questions
- Use numbered lists (1., 2., 3.) for steps or priorities
- Use line breaks to separate different topics
- Use *italics* for emphasis on specific terms
- Keep responses well-structured and easy to read
- Ensure consistent header formatting throughout the response

Your role is to:
1. Listen carefully to patient concerns and symptoms.
2. Ask relevant follow-up questions (especially about skin-related issues).
3. If it seems like a skin problem, suggest uploading a photo for better analysis.
4. Provide general information about possible causes and care tips.
5. Advise when to contact a dermatologist or healthcare provider.
6. Offer emotional reassurance and practical next steps.

Remember:
- For **skin problems**, guide the patient to upload a photo for analysis.
- For **general health issues**, provide safe, general suggestions.
- Always encourage professional medical consultation for confirmation.`;

  }

  /**
   * Analyze an image for medical purposes
   * @param {Buffer} imageBuffer - Image data as buffer
   * @param {string} userMessage - User's description of the image
   * @param {Array} conversationHistory - Previous conversation messages
   * @param {string} languageCode - Language code for response (default: 'en')
   * @returns {Promise<Object>} - AI response with image analysis
   */
  async analyzeImage(imageBuffer, userMessage, conversationHistory = [], languageCode = 'en') {
    try {
      // Build conversation context
      const conversationContext = this.buildConversationContext(conversationHistory);
      
      const languageConfig = this.languageConfigs[languageCode] || this.languageConfigs['en'];
      const languageInstruction = languageCode !== 'en' 
        ? `\n\n**IMPORTANT LANGUAGE INSTRUCTION:** Please respond in ${languageConfig.name} (${languageCode}). Use appropriate medical terminology in ${languageConfig.name}.`
        : '';

      const prompt = `${this.systemPrompt}

${conversationContext}

Patient: ${userMessage}

**[IMAGE ANALYSIS REQUESTED]**

Please analyze the uploaded image and provide a preliminary observation. Focus on:

- **Visible skin conditions**, rashes, lesions, or abnormalities
- **Color, texture, and pattern analysis**
- **Size and distribution** of any visible issues
- **General observations** about the affected area

**Important:** This is a preliminary observation only. Always recommend professional medical consultation for proper diagnosis.${languageInstruction}

Dr. AI:`;

      // Convert image buffer to base64 for Gemini
      const base64Image = imageBuffer.toString('base64');
      
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();

      return {
        message: text.trim(),
        timestamp: new Date().toISOString(),
        model: 'gemini-2.5-flash',
        conversationId: this.generateConversationId(),
        hasImageAnalysis: true
      };
    } catch (error) {
      console.error('Gemini Image Analysis Error:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  /**
   * Generate a response for the telemedicine chatbot
   * @param {string} userMessage - The patient's message
   * @param {Array} conversationHistory - Previous conversation messages
   * @param {string} languageCode - Language code for response (default: 'en')
   * @returns {Promise<Object>} - AI response with message and metadata
   */
  async generateResponse(userMessage, conversationHistory = [], languageCode = 'en') {
    try {
      // Build conversation context
      const conversationContext = this.buildConversationContext(conversationHistory);
      
      const languageConfig = this.languageConfigs[languageCode] || this.languageConfigs['en'];
      const languageInstruction = languageCode !== 'en' 
        ? `\n\n**IMPORTANT LANGUAGE INSTRUCTION:** Please respond in ${languageConfig.name} (${languageCode}). Use appropriate medical terminology in ${languageConfig.name}.`
        : '';

      const prompt = `${this.systemPrompt}

${conversationContext}

Patient: ${userMessage}${languageInstruction}

Dr. AI:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        message: text.trim(),
        timestamp: new Date().toISOString(),
        model: 'gemini-2.5-flash',
        conversationId: this.generateConversationId()
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  /**
   * Build conversation context from history
   * @param {Array} conversationHistory - Array of previous messages
   * @returns {string} - Formatted conversation context
   */
  buildConversationContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return '';
    }

    return conversationHistory
      .map(msg => `${msg.role === 'user' ? 'Patient' : 'Dr. AI'}: ${msg.content}`)
      .join('\n\n');
  }

  /**
   * Generate a unique conversation ID
   * @returns {string} - Unique conversation identifier
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate if the message is appropriate for medical consultation
   * @param {string} message - User message to validate
   * @returns {Object} - Validation result
   */
  validateMedicalMessage(message) {
    const emergencyKeywords = [
      'emergency', 'urgent', 'chest pain', 'difficulty breathing', 
      'severe pain', 'unconscious', 'bleeding', 'stroke', 'heart attack'
    ];
    
    const hasEmergencyKeywords = emergencyKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (hasEmergencyKeywords) {
      return {
        isValid: true,
        isEmergency: true,
        warning: 'This appears to be a medical emergency. Please call emergency services immediately or go to the nearest emergency room.'
      };
    }

    return {
      isValid: true,
      isEmergency: false
    };
  }
}

// Lazy-loaded singleton instance
let instance = null;

module.exports = {
  getInstance() {
    if (!instance) {
      instance = new GeminiService();
    }
    return instance;
  }
};
