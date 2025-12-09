const request = require('supertest');
const app = require('../server');

describe('Telemedicine Chatbot API', () => {
  describe('Health Check', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Chat Endpoints', () => {
    test('POST /api/chat/message should create new conversation', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'I have a mild headache',
          userId: 'test-user-123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('conversationId');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('isEmergency', false);
    });

    test('POST /api/chat/message should detect emergency keywords', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'I have severe chest pain and difficulty breathing',
          userId: 'test-user-123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('isEmergency', true);
      expect(response.body.message).toContain('emergency');
    });

    test('POST /api/chat/message should validate input', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: '', // Empty message
          userId: 'test-user-123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    test('GET /api/chat/conversations/:userId should return user conversations', async () => {
      const response = await request(app)
        .get('/api/chat/conversations/test-user-123')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('conversations');
      expect(Array.isArray(response.body.conversations)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/chat/conversation/invalid-id should return 400', async () => {
      const response = await request(app)
        .get('/api/chat/conversation/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    test('GET /api/chat/conversation/00000000-0000-0000-0000-000000000000 should return 404', async () => {
      const response = await request(app)
        .get('/api/chat/conversation/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Conversation not found');
    });
  });
});
