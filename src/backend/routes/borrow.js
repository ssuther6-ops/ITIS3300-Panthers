/*
 * Borrow and Return Routes
 * 
 * Understanding
 *   This file maps HTTP methods and URL paths to their corresponding controller functions for borrowing.
 *   All routes require a logged in user.
 *
 * What This File Does
 *   POST /api/borrow         - borrowBook()  borrow a book
 *   POST /api/borrow/return  - returnBook()  return a book
 *   GET  /api/borrow/my      - myBooks()     view your active loans
 */

const express = require('express');
const router = express.Router();
const { borrowBook, returnBook, myBooks } = require('../controllers/borrowController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, borrowBook);
router.post('/return', authenticate, returnBook);
router.get('/my', authenticate, myBooks);

module.exports = router;
