/*
 * Understanding
 *   This file is the  entry point for the OLMS backend.
 *   It creates the Express app, registers all middleware,
 *   mounts all API route groups, and starts the HTTP server.
 *
 * What This File Does
 *   1. Loads environment variables from .env (port, DB config, JWT secret)
 *   2. Applies express.json() so all routes can parse JSON request bodies
 *   3. Serves the frontend static files from /frontend
 *   4. Mounts route groups:
 *        /api/auth - registration and login
 *        /api/books - catalog browsing and admin book management
 *        /api/users - admin user management and borrowing history
 *        /api/borrow - borrow, return, and view active loans
 *   5. Catches all unmatched routes and serves index.html (a fallback)
 *   6. Listens on the configured PORT (default: 3000)
 *
 * How to Run
 *   node backend/server.js
 */

const express = require('express');
const path = require('path');
require('dotenv').config();

const authRoutes = require('../auth/authRoutes');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const borrowRoutes = require('./routes/borrow');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrow', borrowRoutes);
 
// Serve frontend
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
 
app.listen(PORT, () => {
  console.log(`OLMS server running on port ${PORT}`);
});
 
module.exports = app;
