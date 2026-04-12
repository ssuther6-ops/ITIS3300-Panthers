/*
 * Book Catalog Routes
 *
 *   This file maps HTTP methods and URL paths to their
 *   corresponding controller functions for book operations.
 *
 * What This File Does
 *   GET    /api/books        - getBooks()    browse/search catalog (public)
 *   GET    /api/books/:id    - getBookById() get one book (public)
 *   POST   /api/books        - addBook()     add a book (admin only)
 *   PUT    /api/books/:id    - updateBook()  edit a book (admin only)
 *   DELETE /api/books/:id    - deleteBook()  remove a book (admin only)
 */

const express = require('express');
const router = express.Router();
const { getBooks, getBookById, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { authenticateToken: authenticate, requireAdmin: adminOnly } = require('../../auth/auth');

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', authenticate, adminOnly, addBook);
router.put('/:id', authenticate, adminOnly, updateBook);
router.delete('/:id', authenticate, adminOnly, deleteBook);

module.exports = router;
