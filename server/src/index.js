import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import listRoutes from './routes/lists.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Middleware
// CORS configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const allowedOrigins = isDevelopment
  ? ['http://localhost:5173', 'http://127.0.0.1:5173']
  : process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [];

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (isDevelopment) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn(`Rejected CORS request from origin: ${origin}`);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
