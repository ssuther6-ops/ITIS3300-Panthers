/*
 * OLMS Backend Server
 *
 * This file is the main entry point for the Online Library Management System backend.
 * It creates the Express application, loads environment variables, applies middleware,
 * serves frontend files, mounts all API routes, and starts the server.
 *
 * Responsibilities:
 * 1. Load environment variables from the .env file
 * 2. Enable JSON parsing for incoming API requests
 * 3. Serve static frontend files
 * 4. Mount API route groups:
 *    - /api/auth   : registration, login, profile, auth security
 *    - /api/books  : catalog browsing and book-related routes
 *    - /api/users  : user management routes
 *    - /api/borrow : borrow and return routes
 * 5. Fallback to index.html for unmatched frontend routes
 * 6. Start the server on the configured port
 *
 * Run with:
 * node backend/server.js
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.log('Error: JWT_SECRET is not set in .env');
  process.exit(1);
}

const authRoutes = require('../auth/authRoutes');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const borrowRoutes = require('./routes/borrow');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrow', borrowRoutes);

// Frontend fallback route
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`OLMS server running on port ${PORT}`);
});

module.exports = app;
