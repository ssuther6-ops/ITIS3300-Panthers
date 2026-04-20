/*
 * Understanding
 * 
 *   This file handles all backend logic related to the book catalog.
 *   It exports five functions, each mapped to a specific API endpoint.
 *
 * Key Terms
 * 
 *   CRUD - Create, Read, Update, Delete — the four basic data operations
 *   ILIKE - PostgreSQL case insensitive search operator
 *   Soft delete - marking a record inactive instead of removing it from the DB, so borrowing history stays 
 *   Params - values passed into SQL queries safely 
 *
 * Functions and What They Do
 *   - getBooks() GET /api/books Returns all books. Supports optional ?search= (title or author)
 *    and ?available=true filters. Results sorted A-Z by title.
 *
 *   - getBookById() GET /api/books/:id  Returns a single book by its ID. Returns 404 if not found.
 *
 *   - addBook() POST /api/books (admin only) Inserts a new book into the catalog. needs a title and author.
 *     Sets total_copies and available_copies to the same starting value.
 *
 *   - updateBook() PUT /api/books/:id (admin only) Updates title, author, ISBN, and genre of an existing book.
 *
 *   - deleteBook()  DELETE /api/books/:id  (admin only) deletes a book by setting is_active = FALSE.
 *     The book is hidden from the catalog but its data is saved .
 */

const pool = require('../db');

const getBooks = async (req, res) => {
  const { search, available, genre, sort } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;  

  let query = 'SELECT * FROM books WHERE is_active = TRUE';
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (title ILIKE $${params.length} OR author ILIKE $${params.length})`;
  }
  if (available === 'true') {
    query += ' AND available_copies > 0';
  }
  if (genre) {
    params.push(genre);
    query += ` AND genre = $${params.length}`;
  }
  // Sort options
  if (sort === 'title_desc') {
    query += ' ORDER BY title DESC';
  } else if (sort === 'author_asc') {
    query += ' ORDER BY author ASC';
  } else if (sort === 'newest') {
    query += ' ORDER BY created_at  DESC';
  } else {
    query += ' ORDER BY title ASC';
  }

  params.push(limit);
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getBooks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBookById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1 AND is_active = TRUE', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getBookById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const addBook = async (req, res) => {
  const { title, author, isbn, genre, total_copies } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'Title and author are required' });

  try {
    const copies = total_copies || 1;
    const result = await pool.query(
      'INSERT INTO books (title, author, isbn, genre, total_copies, available_copies) VALUES ($1,$2,$3,$4,$5,$5) RETURNING *',
      [title, author, isbn, genre, copies]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('addBook error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateBook = async (req, res) => {
  const { title, author, isbn, genre } = req.body;
  try {
    const result = await pool.query(
      'UPDATE books SET title=$1, author=$2, isbn=$3, genre=$4 WHERE id=$5 AND is_active=TRUE RETURNING *',
      [title, author, isbn, genre, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateBook error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteBook = async (req, res) => {
  try {
    await pool.query('UPDATE books SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Book removed from catalog' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getBooks, getBookById, addBook, updateBook, deleteBook };
