const { db } = require('../config/db');

const requirePaymentPerSession = (req, res, next) => {
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return next();
  }

  // The verifyToken middleware has already run and attached userId and sid
  const { userId, sid: sessionId } = req;
  if (!userId || !sessionId) {
    return res.status(401).json({ message: 'Authentication details missing.' });
  }

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
        if (!payment) return res.status(402).json({ message: 'Payment required', requiresPayment: true });
        next();
      }
    );
  });
};

module.exports = requirePaymentPerSession;
