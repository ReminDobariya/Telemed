# Authentication API Testing Guide

## Server Setup
1. Navigate to the scripts folder
2. Install dependencies: `npm install`
3. Start server: `npm start` or `npm run dev` (for auto-reload)
4. Server runs on: `http://localhost:3001`

## Postman Testing

### 1. Health Check
**GET** `http://localhost:3001/api/health`
- No body required
- Should return server status

### 2. Register User
**POST** `http://localhost:3001/api/register`

**Headers:**
\`\`\`
Content-Type: application/json
\`\`\`

**Body (JSON):**
\`\`\`json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
\`\`\`

### 3. Login User
**POST** `http://localhost:3001/api/login`

**Headers:**
\`\`\`
Content-Type: application/json
\`\`\`

**Body (JSON):**
\`\`\`json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
\`\`\`

### 4. Get Profile (Protected Route)
**GET** `http://localhost:3001/api/profile`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

### 5. Get All Users
**GET** `http://localhost:3001/api/users`
- No authentication required (for testing only)
- Returns list of all registered users

## Error Responses

### Validation Errors (400)
\`\`\`json
{
  "success": false,
  "message": "All fields are required"
}
\`\`\`

### Authentication Errors (401)
\`\`\`json
{
  "success": false,
  "message": "Invalid email or password"
}
\`\`\`

### Conflict Errors (409)
\`\`\`json
{
  "success": false,
  "message": "User with this email already exists"
}
\`\`\`

## Notes
- Passwords are hashed using bcrypt
- JWT tokens expire in 24 hours
- User data is stored in memory (resets on server restart)
- CORS is enabled for frontend integration
- Change JWT_SECRET in production
