const { v4: uuidv4 } = require('uuid');

class ConversationService {
  constructor() {
    // In-memory storage for conversations
    // In production, this should be replaced with a database
    this.conversations = new Map();
  }

  /**
   * Create a new conversation
   * @param {string} userId - User identifier
   * @param {string} [customId] - Optional custom conversation ID
   * @returns {Object} - New conversation object
   */
  createConversation(userId, customId = null) {
    const conversationId = customId || uuidv4();
    const conversation = {
      id: conversationId,
      userId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  /**
   * Get a conversation by ID
   * @param {string} conversationId - Conversation identifier
   * @returns {Object|null} - Conversation object or null if not found
   */
  getConversation(conversationId) {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Get all conversations for a user
   * @param {string} userId - User identifier
   * @returns {Array} - Array of conversation objects
   */
  getUserConversations(userId) {
    const userConversations = [];
    for (const conversation of this.conversations.values()) {
      if (conversation.userId === userId) {
        userConversations.push(conversation);
      }
    }
    return userConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Add a message to a conversation
   * @param {string} conversationId - Conversation identifier
   * @param {string} role - Message role ('user' or 'assistant')
   * @param {string} content - Message content
   * @param {Object} metadata - Additional message metadata
   * @returns {Object|null} - Updated conversation or null if not found
   */
  addMessage(conversationId, role, content, metadata = {}) {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return null;
    }

    const message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    return conversation;
  }

  /**
   * Update conversation status
   * @param {string} conversationId - Conversation identifier
   * @param {string} status - New status ('active', 'completed', 'archived')
   * @returns {Object|null} - Updated conversation or null if not found
   */
  updateConversationStatus(conversationId, status) {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return null;
    }

    conversation.status = status;
    conversation.updatedAt = new Date().toISOString();

    return conversation;
  }

  /**
   * Delete a conversation
   * @param {string} conversationId - Conversation identifier
   * @returns {boolean} - True if deleted, false if not found
   */
  deleteConversation(conversationId) {
    return this.conversations.delete(conversationId);
  }

  /**
   * Get conversation statistics
   * @param {string} conversationId - Conversation identifier
   * @returns {Object|null} - Statistics object or null if not found
   */
  getConversationStats(conversationId) {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return null;
    }

    const userMessages = conversation.messages.filter(msg => msg.role === 'user');
    const assistantMessages = conversation.messages.filter(msg => msg.role === 'assistant');

    return {
      totalMessages: conversation.messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      duration: this.calculateDuration(conversation.createdAt, conversation.updatedAt),
      status: conversation.status
    };
  }

  /**
   * Calculate duration between two timestamps
   * @param {string} startTime - Start timestamp
   * @param {string} endTime - End timestamp
   * @returns {string} - Formatted duration
   */
  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Clean up old conversations (older than specified days)
   * @param {number} daysOld - Number of days
   * @returns {number} - Number of conversations cleaned up
   */
  cleanupOldConversations(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let cleanedCount = 0;
    for (const [id, conversation] of this.conversations.entries()) {
      if (new Date(conversation.createdAt) < cutoffDate) {
        this.conversations.delete(id);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }
}

// Lazy-loaded singleton instance
let instance = null;

module.exports = {
  getInstance() {
    if (!instance) {
      instance = new ConversationService();
    }
    return instance;
  }
};
