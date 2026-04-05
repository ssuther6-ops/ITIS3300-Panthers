const pool = require('../backend/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Password validation function
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

// Register Controller
const register = async (req, res) => {
  let { name, email, username, password } = req.body;

  // Trim inputs
  name = name?.trim();
  email = email?.trim().toLowerCase();
  username = username?.trim();

  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // 🔐 Password validation (YOUR MAIN CONTRIBUTION)
  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
    });
  }

  try {
    // Check if user exists
    const exists = await pool.query(
      'SELECT id FROM users WHERE email=$1 OR username=$2',
      [email, username]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        error: 'Username or email already taken',
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, username, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, username, role',
      [name, email, username, hash, 'user']
    );

    return res.status(201).json({
      message: 'Account created',
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Login Controller
const login = async (req, res) => {
  let { username, password } = req.body;

  username = username?.trim();

  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password are required',
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username=$1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid username or password',
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        error: 'Invalid username or password',
      });
    }

    // Ensure JWT secret exists
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: 'JWT secret is not configured',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1800s' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login };
