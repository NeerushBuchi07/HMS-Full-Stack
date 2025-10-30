require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log("Loaded MONGODB_URI =", process.env.MONGODB_URI);

// Avoid populate errors
mongoose.set('strictPopulate', false);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Hospital Management System API is running 🚑' });
});

// Routes
app.use('/api/auth', require('./routes/Auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/specializations', require('./routes/specializations'));
app.use('/api/departments', require('./routes/departments'));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Atlas connected successfully'))
.catch(err => {
  console.error('❌ MongoDB Atlas connection error:', err);
  process.exit(1);
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 MongoDB Atlas URI Loaded from .env`);
  console.log(`🌍 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Test the API: http://localhost:${PORT}/api/health`);
});
