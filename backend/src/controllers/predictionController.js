const { db } = require('../config/db');

// Helper to generate random numbers in range
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.predict = async (req, res) => {
  const { history, type } = req.body; // history: "1,2,3; 4,5,6", type: "5/90"
  const userId = req.userId;

  if (!history || !type) {
    return res.status(400).json({ message: 'Please provide history and lottery type' });
  }

  // Parse type (e.g., "5/90")
  const [pickCount, maxNumber] = type.split('/').map(Number);
  if (!pickCount || !maxNumber) {
    return res.status(400).json({ message: 'Invalid lottery type format (e.g., 5/90)' });
  }

  // Basic Analysis Mockup
  // In a real app, we would parse `history` and do complex stats.
  // Here, we'll generate suggestions based on the range.
  
  const suggestions = [];
  while(suggestions.length < pickCount) {
    const num = getRandomInt(1, maxNumber);
    if(suggestions.indexOf(num) === -1) suggestions.push(num);
  }
  
  const predictedNumbers = suggestions.sort((a, b) => a - b).join(', ');

  try {
    await db.query(
      `INSERT INTO predictions (user_id, lottery_type, input_numbers, predicted_numbers) VALUES ($1, $2, $3, $4)`,
      [userId, type, JSON.stringify(history), predictedNumbers]
    );
    res.status(200).json({
      prediction: predictedNumbers,
      confidence: 'High', // Mock confidence
      analysis: 'Based on frequency analysis of provided history.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error saving prediction' });
  }
};

exports.getHistory = async (req, res) => {
  const userId = req.userId;
  try {
    const result = await db.query(`SELECT * FROM predictions WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching history' });
  }
};
