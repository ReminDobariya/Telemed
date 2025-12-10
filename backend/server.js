const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const { router: authRoutes } = require('./routes/auth');
const { router: doctorAuthRoutes } = require('./routes/doctor-auth');
const userRoutes = require('./routes/user');
const appointmentsRoutes = require('./routes/appointments');
const doctorAppointmentsRoutes = require('./routes/doctor-appointments');
const prescriptionsRoutes = require('./routes/prescriptions');
const healthRoutes = require('./routes/health');
const medicationsRoutes = require('./routes/medications');
const allergiesRoutes = require('./routes/allergies');
const conversationsRoutes = require('./routes/conversations');
const notificationsRoutes = require('./routes/notifications');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - configure to work with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - uses only environment variables
const corsOriginEnv = process.env.CORS_ORIGIN;

if (!corsOriginEnv) {
  console.error('❌ ERROR: CORS_ORIGIN must be set in environment variables');
  console.error('   Example: CORS_ORIGIN=http://localhost:3000,https://f38c9smc-3000.inc1.devtunnels.ms');
  process.exit(1);
}

// Parse allowed origins from environment variable (comma-separated)
const allowedOrigins = corsOriginEnv.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0);

if (allowedOrigins.length === 0) {
  console.error('❌ ERROR: At least one origin must be provided in CORS_ORIGIN');
  process.exit(1);
}

console.log(`✅ CORS: Allowing origins: ${allowedOrigins.join(', ')}`);

// CORS configuration with origin validation function
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('⚠️  CORS: Request with no origin (allowing)');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list from environment
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`⚠️  CORS: Blocked origin ${origin} (not in CORS_ORIGIN env)`);
      console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 100 to 1000
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  // Allow disabling the limiter for local development or CI
  skip: (req) => {
    // Disable if env var is set
    if (process.env.DISABLE_RATE_LIMIT === 'true') return true;
    // Skip rate limiting for auth endpoints (login/register are critical)
    if (req.path.startsWith('/api/auth/') || req.path.startsWith('/api/doctor/auth/')) return true;
    return false;
  },
});

// Apply rate limiting to all API routes except auth
app.use('/api/', (req, res, next) => {
  // Skip rate limiting for auth endpoints (check both with and without /api prefix)
  const path = req.path || req.url;
  if (path.startsWith('/auth/') || path.startsWith('/doctor/auth/') || 
      path.startsWith('/api/auth/') || path.startsWith('/api/doctor/auth/')) {
    return next();
  }
  return limiter(req, res, next);
});

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect database
const { connectMongo } = require('./services/db');
connectMongo().catch(err => {
  console.error('Mongo connection failed:', err);
  process.exit(1);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctor/auth', doctorAuthRoutes);
app.use('/api/user', userRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/doctor/appointments', doctorAppointmentsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
const doctorPrescriptionsRoutes = require('./routes/doctor-prescriptions');
app.use('/api/doctor/prescriptions', doctorPrescriptionsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/allergies', allergiesRoutes);
const doctorsRoutes = require('./routes/doctors');
app.use('/api/doctors', doctorsRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server for WebSocket support
const httpServer = http.createServer(app);

// Setup WebSocket for video consultations
const { setupWebSocket } = require('./routes/websocket');
setupWebSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Telemedicine Chatbot Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📹 WebSocket: ws://localhost:${PORT}/ws/consultation/:appointmentId`);
});

// Simple appointment reminder scheduler (runs in-process)
try {
  const Appointment = require('./models/Appointment');
  const Notification = require('./models/Notification');
  const REMINDER_WINDOW_MINUTES = 10;

  async function checkAndSendReminders() {
    const now = new Date();
    const windowStart = new Date(now.getTime() + (REMINDER_WINDOW_MINUTES - 1) * 60 * 1000);
    const windowEnd = new Date(now.getTime() + (REMINDER_WINDOW_MINUTES + 1) * 60 * 1000);

    try {
      const upcoming = await Appointment.find({
        status: { $in: ['accepted', 'scheduled'] },
        time: { $gte: windowStart, $lte: windowEnd },
        reminderSent: { $ne: true },
      }).limit(100);

      for (const appt of upcoming) {
        try {
          await Notification.create({
            userId: appt.userId,
            type: 'appointment_reminder',
            title: 'Upcoming Appointment',
            message: `Your appointment is at ${new Date(appt.time).toLocaleString()}. You can join 10 minutes before.`,
            appointmentId: appt._id,
          });
          appt.reminderSent = true;
          await appt.save();
          console.log(`🔔 Reminder sent for appointment ${appt._id}`);
        } catch (err) {
          console.error('Failed to send reminder:', err);
        }
      }
    } catch (err) {
      console.error('Reminder scheduler error:', err);
    }
  }

  // Run every minute
  setInterval(checkAndSendReminders, 60 * 1000);
  console.log('🕒 Appointment reminder scheduler started');
} catch (err) {
  console.error('Failed to start reminder scheduler:', err);
}

module.exports = app;
