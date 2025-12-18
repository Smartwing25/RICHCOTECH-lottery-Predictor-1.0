const { db } = require('../config/db');
const jwt = require('jsonwebtoken');

const requirePaymentPerSession = async (req, res, next) => {
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

  try {
    const userResult = await db.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'No user found' });
    if (user.role === 'admin') {
      return next();
    }
    const paymentResult = await db.query(`SELECT id FROM payments WHERE user_id = $1 AND login_session_id = $2 AND status = 'success' ORDER BY id DESC LIMIT 1`, [userId, sessionId]);
    if (paymentResult.rows.length === 0) {
      return res.status(402).json({ message: 'Payment required', requiresPayment: true });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error checking payment status' });
  }
};

module.exports = requirePaymentPerSession;
