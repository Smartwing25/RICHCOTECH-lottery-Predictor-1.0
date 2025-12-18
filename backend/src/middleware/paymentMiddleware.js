const { db } = require('../config/db');
const jwt = require('jsonwebtoken');

const requirePaymentPerSession = (req, res, next) => {
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return next();
  }
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided.' });
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format.' });
  }
  let decoded;
  try {
    decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to authenticate token.' });
  }
  const userId = decoded.id;
  const sessionId = decoded.sid;

  db.get(`SELECT role FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) return res.status(404).json({ message: 'No user found' });
    if (user.role === 'admin') {
      return next();
    }
    db.get(
      `SELECT id FROM payments WHERE user_id = ? AND login_session_id = ? AND status = 'success' ORDER BY id DESC LIMIT 1`,
      [userId, sessionId],
      (e2, payment) => {
        if (e2) return res.status(500).json({ message: 'Server error' });
        if (!payment) {
          return res.status(402).json({ message: 'Payment required', requiresPayment: true });
        }
        next();
      }
    );
  });
};

module.exports = requirePaymentPerSession;
