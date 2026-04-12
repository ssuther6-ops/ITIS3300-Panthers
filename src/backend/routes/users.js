/*
 * User Management Routes
 * 
 *   This file maps HTTP methods and URL paths to their
 *   cornnecting controller functions for user management.
 *   All routes here are admin only.
 *
 * What This File Does
 *   GET /api/users             - getAllUsers()      list all accounts
 *   PUT /api/users/:id/deactivate - deactivateUser() disable a user
 *   GET /api/users/history     - getBorrowHistory() full audit log
 */

const express = require('express');
const router = express.Router();
const { getAllUsers, deactivateUser, getBorrowHistory } = require('../controllers/userController');
const { authenticateToken: authenticate, requireAdmin: adminOnly } = require('../../auth/auth');

router.get('/', authenticate, adminOnly, getAllUsers);
router.put('/:id/deactivate', authenticate, adminOnly, deactivateUser);
router.get('/history', authenticate, adminOnly, getBorrowHistory);

module.exports = router;
