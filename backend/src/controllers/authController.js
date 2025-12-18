const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { randomUUID } = require('crypto');

exports.register = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(`INSERT INTO users (email, password, role) VALUES (?, ?, 'user')`, [email, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Error registering user' });
    }
    
    // Create token
    const token = jwt.sign({ id: this.lastID, sid: randomUUID() }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    db.get(`SELECT id, email, role FROM users WHERE id = ?`, [this.lastID], (e, u) => {
      if (e || !u) return res.status(201).json({ auth: true, token, user: { id: this.lastID, email } });
      res.status(201).json({ auth: true, token, user: { id: u.id, email: u.email, role: u.role }, requiresPayment: u.role !== 'admin' });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ message: 'Error on server' });
    if (!user) return res.status(404).json({ message: 'No user found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ auth: false, token: null, message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, sid: randomUUID() }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    const isPaymentEnabled = process.env.PAYMENT_ENABLED === 'true';
    res.status(200).json({
      auth: true,
      token,
      user: { id: user.id, email: user.email, role: user.role || 'user' },
      requiresPayment: isPaymentEnabled ? ((user.role || 'user') !== 'admin') : false
    });
  });
};

exports.me = (req, res) => {
    db.get(`SELECT id, email, role, created_at FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ message: "There was a problem finding the user." });
        if (!user) return res.status(404).json({ message: "No user found." });
        res.status(200).json(user);
    });
};
