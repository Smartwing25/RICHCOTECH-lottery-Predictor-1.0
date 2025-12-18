const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/initiate', verifyToken, paymentController.initiate);
router.post('/callback', paymentController.callback); // Hubtel calls this, no auth
router.get('/status', verifyToken, paymentController.statusForSession);

module.exports = router;

