const { db } = require('../config/db');
const jwt = require('jsonwebtoken');
const https = require('https');

const HUBTEL_BASE = process.env.HUBTEL_BASE || 'https://sandbox.hubtel.com';
const MERCHANT_ACCOUNT = process.env.HUBTEL_MERCHANT_ACCOUNT || '';
const CLIENT_ID = process.env.HUBTEL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.HUBTEL_CALLBACK_URL || 'http://localhost:5000/api/payment/callback';

const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

exports.initiate = (req, res) => {
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return res.status(200).json({ status: 'disabled', message: 'Payment disabled' });
  }
  const token = req.headers['authorization'];
  const tokenParts = token.split(' ');
  const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
  const userId = decoded.id;
  const sessionId = decoded.sid;

  const { phone, channel = 'vodafone' } = req.body;
  const amount = 5;

  db.get(`SELECT role FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (user.role === 'admin') {
      return res.status(200).json({ status: 'bypass', message: 'Admin payment bypass' });
    }

    const payload = {
      Amount: amount,
      Description: 'RICHCOTECH Dashboard Access',
      CustomerMsisdn: phone,
      ClientReference: sessionId,
      Channel: channel,
      PrimaryCallbackUrl: CALLBACK_URL,
      FeesOnCustomer: true,
      MerchantAccountNumber: MERCHANT_ACCOUNT
    };

    const data = JSON.stringify(payload);
    const options = {
      hostname: HUBTEL_BASE.replace('https://', '').replace('http://', ''),
      path: '/merchant/v2/transaction/mobile/charge',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = { Status: 'Failed', Message: 'Invalid response' };
        }

        const transactionId = parsed?.TransactionId || parsed?.TransactionID || parsed?.Data?.TransactionId || null;
        const status = parsed?.Status || 'Initiated';

        db.run(
          `INSERT INTO payments (user_id, amount, status, transaction_id, login_session_id) VALUES (?, ?, ?, ?, ?)`,
          [userId, amount, status.toLowerCase(), transactionId, sessionId],
          function (e2) {
            if (e2) return res.status(500).json({ message: 'Failed to record payment' });
            return res.status(200).json({ status: status.toLowerCase(), transactionId, sessionId });
          }
        );
      });
    });

    request.on('error', (e) => {
      db.run(
        `INSERT INTO payments (user_id, amount, status, transaction_id, login_session_id) VALUES (?, ?, ?, ?, ?)`,
        [userId, amount, 'failed', null, sessionId]
      );
      res.status(500).json({ message: 'Payment initiation failed' });
    });

    request.write(data);
    request.end();
  });
};

exports.callback = (req, res) => {
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return res.status(200).json({ ok: true, message: 'Payment disabled' });
  }
  const { TransactionId, ClientReference, Status } = req.body || {};
  const sessionId = ClientReference;
  const status = (Status || '').toLowerCase();

  if (!sessionId) return res.status(400).json({ message: 'Missing session reference' });

  db.run(
    `UPDATE payments SET status = ?, transaction_id = ? WHERE login_session_id = ?`,
    [status, TransactionId || null, sessionId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Failed to update payment' });
      res.status(200).json({ ok: true });
    }
  );
};

exports.statusForSession = (req, res) => {
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return res.status(200).json({ status: 'disabled' });
  }
  const token = req.headers['authorization'];
  const tokenParts = token.split(' ');
  const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
  const userId = decoded.id;
  const sessionId = decoded.sid;

  db.get(
    `SELECT status, transaction_id, amount, created_at FROM payments WHERE user_id = ? AND login_session_id = ? ORDER BY id DESC LIMIT 1`,
    [userId, sessionId],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!row) return res.status(200).json({ status: 'none' });
      res.status(200).json(row);
    }
  );
};
