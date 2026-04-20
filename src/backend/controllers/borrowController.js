/*
 * Borrow and Return Logic 
 * This file handles all borrowing and returning of books.
 * it manages inventory counts and guarantee that the 
 * database dosent have a broken state if something goes wrong
 *
 * Key Terms
 * 
 *   Transaction - a group of DB operations that succeed or fail together
 *   BEGIN/COMMIT - SQL commands that wrap multiple queries into one operation
 *   ROLLBACK - undoes all changes if any query in the transaction fails
 *   Atomic - either everything happens, or nothing happens (no partial updates)
 *   Active loan  = a borrowing record with status = 'active' (not yet returned)
 *
 * Functions and What They Do
 * 
 *   1. borrowBook() POST /api/borrow
 *   Lets an authenticated user borrow a book. 
 * 
 *   Before creating the loan:
 *     - Checks the user hasnt hit the 3 book borrow limit
 *     - Checks the book exists and has available copies
 *     - Checks the user doesnt already have this book borrowed
 * 
 *   Then atomically:
 *     - Inserts a row into borrowing_transactions
 *     - Decrements available_copies on the book by 1
 *
 *   2. returnBook() POST /api/borrow/return
 *        Lets a user return a book they have borrowed. 
 *        Atomically:
 *             - Sets the transaction status to returned and records returned_at
 *             - Increases available_copies on the book by 1
 *
 *   3. myBooks() GET /api/borrow/my
 *      Returns all borrowing records (active and returned) for the
 *      currently logged in user, with the book title and author.
 */

const pool = require('../db');

const MAX_BORROW_LIMIT = 3;

const borrowBook = async (req, res) => {
  const { book_id } = req.body;
  const user_id = req.user.id;

 const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check borrow limit 
    const activeLoans = await client.query(
      "SELECT COUNT(*) FROM borrowing_transactions WHERE user_id=$1 AND status='active'",
      [user_id]
    );
    if (parseInt(activeLoans.rows[0].count) >= MAX_BORROW_LIMIT) {
  await client.query('ROLLBACK');
  client.release();
  return res.status(400).json({ error: `Borrow limit of ${MAX_BORROW_LIMIT} books reached` });
}

    // Check if book exists and is available, inside transaction, no race
    const book = await client.query('SELECT * FROM books WHERE id=$1 AND is_active=TRUE', [book_id]);
    if (book.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.rows[0].available_copies < 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No available copies' });
    }

    // Check user doesn't already have this book 
    const existing = await client.query(
      "SELECT * FROM borrowing_transactions WHERE user_id=$1 AND book_id=$2 AND status='active'",
      [user_id, book_id]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You already have this book borrowed' });
    }
    
    // Do the borrow 
    const tx = await client.query(
      'INSERT INTO borrowing_transactions (user_id, book_id) VALUES ($1,$2) RETURNING *',
      [user_id, book_id]
    );
    await client.query('UPDATE books SET available_copies = available_copies - 1 WHERE id=$1', [book_id]);
    await client.query('COMMIT');

    res.status(201).json({ message: 'Book borrowed successfully', transaction: tx.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Borrow error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const returnBook = async (req, res) => {
  const { transaction_id } = req.body;
  const user_id = req.user.id;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tx = await client.query(
      "SELECT * FROM borrowing_transactions WHERE id=$1 AND user_id=$2 AND status='active'",
      [transaction_id, user_id]
    );
   if (tx.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Active transaction not found' });
    }

    await client.query(
      "UPDATE borrowing_transactions SET status='returned', returned_at=NOW() WHERE id=$1",
      [transaction_id]
    );
    await client.query('UPDATE books SET available_copies = available_copies + 1 WHERE id=$1', [tx.rows[0].book_id]);
    await client.query('COMMIT');

    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Return error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const myBooks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bt.id as transaction_id, b.title, b.author, bt.borrowed_at, bt.due_date, bt.returned_at,
              CASE
                WHEN bt.status = 'active' AND bt.due_date < NOW() THEN 'overdue'
                ELSE bt.status
              END AS status
       FROM borrowing_transactions bt
       JOIN books b ON bt.book_id = b.id
       WHERE bt.user_id=$1 ORDER BY bt.borrowed_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('My Books error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { borrowBook, returnBook, myBooks };
