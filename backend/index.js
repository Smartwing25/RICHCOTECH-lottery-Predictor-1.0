const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const predictionRoutes = require('./src/routes/predictionRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { initDb } = require('./src/config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/payment', paymentRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Richcotech Lottery API is running');
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const distPath = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(distPath, { maxAge: '1d' }));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Initialize DB and Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
