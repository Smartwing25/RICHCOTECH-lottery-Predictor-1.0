const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const verifyToken = require('../middleware/authMiddleware');
const requirePaymentPerSession = require('../middleware/paymentMiddleware');

router.post('/predict', verifyToken, requirePaymentPerSession, predictionController.predict);
router.get('/history', verifyToken, requirePaymentPerSession, predictionController.getHistory);

module.exports = router;
