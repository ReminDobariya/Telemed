import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cors from "cors"

const app = express()
const PORT = 3001
const JWT_SECRET = "your-secret-key-change-in-production"

// Middleware
app.use(express.json())
app.use(cors())

// In-memory user storage (replace with database in production)
const users = []

// Helper function to find user by email
const findUserByEmail = (email) => {
  return users.find((user) => user.email === email)
}

// Register endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      })
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "24h" })

    // Return success response (don't send password)
    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Find user
    const user = findUserByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" })

    // Return success response (don't send password)
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Protected route example (verify JWT token)
app.get("/api/profile", (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = users.find((u) => u.id === decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }

    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    })
  }
})

// Get all users (for testing purposes)
app.get("/api/users", (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user)
  res.json({
    success: true,
    data: {
      users: usersWithoutPasswords,
      count: users.length,
    },
  })
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auth API server running on http://localhost:${PORT}`)
  console.log(`📋 Available endpoints:`)
  console.log(`   POST /api/register - Register new user`)
  console.log(`   POST /api/login - Login user`)
  console.log(`   GET  /api/profile - Get user profile (requires Bearer token)`)
  console.log(`   GET  /api/users - Get all users`)
  console.log(`   GET  /api/health - Health check`)
})

export default app
