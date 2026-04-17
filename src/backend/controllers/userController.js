/*
 *  Admin User Management
 *
 * Understanding
 *   This file handles admins operations on user accounts and
 *   provides a audit log of all borrowing activity in the system.
 *   All three endpoints require both authentication and admin role.
 *
 * Key Terms
 * Soft delete - setting is_active = FALSE instead of deleting the row, so the user's borrowing history is preserved
 * JOIN - SQL operation that combines rows from multiple tables based on a related column like user_id, book_id)
 * Audit log - a full history of who borrowed what and when, used for debugging
 *
 * Functions and What They Do
 *  - getAllUsers() - GET /api/users  (admin only)
 *    Returns all user accounts sorted by the created date.
 *    Password hashes are excluded from the response.
 *
 *  - deactivateUser() - PUT /api/users/:id/deactivate  (admin only)
 *    deletes a user account by setting is_active = FALSE.
 *    The user can no longer log in but their records remain.
 *
 *  - getBorrowHistory() - GET /api/users/history  (admin only)
 *    Returns every borrowing transaction in the system, 
 *    joined with the borrower's username and the book title. Sorted by most recent first.
 */

const pool = require('../db');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, username, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deactivated' });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBorrowHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bt.id, u.username, b.title, bt.borrowed_at, bt.due_date, bt.returned_at, bt.status
       FROM borrowing_transactions bt
       JOIN users u ON bt.user_id = u.id
       JOIN books b ON bt.book_id = b.id
       ORDER BY bt.borrowed_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching borrow history:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllUsers, deactivateUser, getBorrowHistory };
