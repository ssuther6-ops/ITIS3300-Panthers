const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
} = require('./authController');

const {
  authenticateToken,
  requireAdmin,
} = require('./auth');


router.post('/register', register);
router.post('/login', login);


router.get('/profile', authenticateToken, getProfile);

router.get('/admin-test', authenticateToken, requireAdmin, (req, res) => {
  return res.status(200).json({
    message: 'Admin route accessed successfully',
  });
});

module.exports = router;
