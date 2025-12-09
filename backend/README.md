# Telemedicine Chatbot Backend

A Node.js + Express backend application for a telemedicine chatbot powered by Google Gemini 2.5 Flash model. This application provides AI-powered medical consultation support through a RESTful API.

## 🚀 Features

- **AI-Powered Medical Chat**: Uses Google Gemini 2.5 Flash for intelligent medical conversations
- **Conversation Management**: Track and manage patient-doctor style conversations
- **Emergency Detection**: Automatically detects emergency keywords and provides appropriate responses
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **Security**: Helmet.js for security headers and CORS protection
- **Validation**: Comprehensive input validation using express-validator
- **Error Handling**: Robust error handling with detailed error messages
- **Health Monitoring**: Health check endpoint for monitoring

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn
- Google Gemini API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd telemedicine-chatbot-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file and add your configuration:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Get Google Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
Returns server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

#### 2. Send Message
```http
POST /api/chat/message
```
Send a message to the telemedicine chatbot.

**Request Body:**
```json
{
  "message": "I have a headache and feel dizzy",
  "conversationId": "optional-uuid",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "I understand you're experiencing a headache and dizziness. These symptoms can have various causes...",
  "conversationId": "conv-1234567890-abcdef",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "isEmergency": false
}
```

#### 3. Get User Conversations
```http
GET /api/chat/conversations/:userId
```
Get all conversations for a specific user.

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv-1234567890-abcdef",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:30:00.000Z",
      "status": "active",
      "messageCount": 10
    }
  ]
}
```

#### 4. Get Conversation Details
```http
GET /api/chat/conversation/:conversationId
```
Get detailed conversation with all messages.

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "conv-1234567890-abcdef",
    "userId": "user123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:30:00.000Z",
    "status": "active",
    "messages": [
      {
        "id": "msg-1234567890-abcdef",
        "role": "user",
        "content": "I have a headache",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "metadata": {}
      },
      {
        "id": "msg-1234567890-ghijkl",
        "role": "assistant",
        "content": "I understand you're experiencing a headache...",
        "timestamp": "2024-01-01T00:01:00.000Z",
        "metadata": {
          "model": "gemini-2.0-flash-exp"
        }
      }
    ]
  }
}
```

#### 5. Update Conversation Status
```http
PUT /api/chat/conversation/:conversationId/status
```
Update the status of a conversation.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid statuses:** `active`, `completed`, `archived`

#### 6. Get Conversation Statistics
```http
GET /api/chat/conversation/:conversationId/stats
```
Get statistics for a conversation.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalMessages": 20,
    "userMessages": 10,
    "assistantMessages": 10,
    "duration": "30m 45s",
    "status": "active"
  }
}
```

#### 7. Delete Conversation
```http
DELETE /api/chat/conversation/:conversationId
```
Delete a conversation permanently.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse with configurable limits
- **Input Validation**: Comprehensive validation for all inputs
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: Secure error messages without sensitive data exposure

## 🚨 Emergency Detection

The chatbot automatically detects emergency keywords and responds appropriately:

- **Emergency Keywords**: emergency, urgent, chest pain, difficulty breathing, severe pain, unconscious, bleeding, stroke, heart attack
- **Response**: Immediate warning to contact emergency services

## 📊 Monitoring

### Health Check
Monitor application health using:
```bash
curl http://localhost:3000/health
```

### Logs
The application uses Morgan for HTTP request logging. In production, consider using a proper logging service.

## 🧪 Testing

Run tests using:
```bash
npm test
```

## 🚀 Deployment

### Docker (Optional)
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Set up proper logging
4. Consider using a database for conversation storage
5. Set up monitoring and alerting

## 📝 Important Notes

### Medical Disclaimer
This chatbot is designed for general health information and guidance only. It is NOT a replacement for professional medical diagnosis or treatment. Always consult with qualified healthcare providers for serious symptoms or medical concerns.

### Data Storage
Currently uses in-memory storage for conversations. For production:
- Implement database storage (MongoDB, PostgreSQL, etc.)
- Add data persistence
- Implement backup strategies
- Consider data retention policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review error logs for troubleshooting

---

**⚠️ Medical Disclaimer**: This application is for educational and informational purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.
