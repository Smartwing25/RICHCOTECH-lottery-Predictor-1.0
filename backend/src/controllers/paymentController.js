const { db } = require('../config/db');
const jwt = require('jsonwebtoken');
const https = require('https');

const HUBTEL_BASE = process.env.HUBTEL_BASE || 'https://sandbox.hubtel.com';
const MERCHANT_ACCOUNT = process.env.HUBTEL_MERCHANT_ACCOUNT || '';
const CLIENT_ID = process.env.HUBTEL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.HUBTEL_CALLBACK_URL || 'http://localhost:5000/api/payment/callback';

const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

exports.initiate = async (req, res) => {
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

  try {
    const userResult = await db.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

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

        db.query(
          `INSERT INTO payments (user_id, amount, status, transaction_id, login_session_id) VALUES ($1, $2, $3, $4, $5)`,
          [userId, amount, status.toLowerCase(), transactionId, sessionId]
        ).then(() => {
          return res.status(200).json({ status: status.toLowerCase(), transactionId, sessionId });
        }).catch(e2 => {
          console.error("Failed to record payment", e2);
          return res.status(500).json({ message: 'Failed to record payment' });
        });
      });
    });

    request.on('error', (e) => {
      db.query(
        `INSERT INTO payments (user_id, amount, status, transaction_id, login_session_id) VALUES ($1, $2, $3, $4, $5)`,
        [userId, amount, 'failed', null, sessionId]
      ).catch(dbErr => console.error("Failed to record failed payment attempt", dbErr));
      res.status(500).json({ message: 'Payment initiation failed' });
    });

    request.write(data);
    request.end();
  } catch (err) {
    return res.status(500).json({ message: 'Server error during payment initiation' });
  }
};

exports.callback = async (req, res) => {
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return res.status(200).json({ ok: true, message: 'Payment disabled' });
  }
  const { TransactionId, ClientReference, Status } = req.body || {};
  const sessionId = ClientReference;
  const status = (Status || '').toLowerCase();
  if (!sessionId) return res.status(400).json({ message: 'Missing session reference' });

  try {
    await db.query(`UPDATE payments SET status = $1, transaction_id = $2 WHERE login_session_id = $3`, [status, TransactionId || null, sessionId]);
    res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update payment' });
  }
};

exports.statusForSession = async (req, res) => {
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return res.status(200).json({ status: 'disabled' });
  }
  const token = req.headers['authorization'];
  const tokenParts = token.split(' ');
  const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
  const userId = decoded.id;
  const sessionId = decoded.sid;

  try {
    const result = await db.query(
      `SELECT status, transaction_id, amount, created_at FROM payments WHERE user_id = $1 AND login_session_id = $2 ORDER BY id DESC LIMIT 1`,
      [userId, sessionId]
    );
    if (result.rows.length === 0) return res.status(200).json({ status: 'none' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
