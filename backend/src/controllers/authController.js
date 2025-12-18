const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { randomUUID } = require('crypto');

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const insertResult = await db.query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, 'user') RETURNING id, email, role`,
      [email, hashedPassword]
    );
    const newUser = insertResult.rows[0];

    const token = jwt.sign({ id: newUser.id, sid: randomUUID() }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.status(201).json({ auth: true, token, user: newUser, requiresPayment: newUser.role !== 'admin' });
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Email already exists' });
    }
    return res.status(500).json({ message: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: 'No user found.' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ auth: false, token: null, message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, sid: randomUUID() }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    const isPaymentEnabled = process.env.PAYMENT_ENABLED === 'true';
    res.status(200).json({ auth: true, token, user, requiresPayment: isPaymentEnabled ? user.role !== 'admin' : false });
  } catch (err) {
    return res.status(500).json({ message: 'Error on server.' });
  }
};

exports.me = async (req, res) => {
  try {
    const result = await db.query(`SELECT id, email, role, created_at FROM users WHERE id = $1`, [req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: "No user found." });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "There was a problem finding the user." });
  }
};
