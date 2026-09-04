require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');

const app = express();

// Allow requests from your frontend (adjust in .env as needed)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Simple request logger so you can see activity in the terminal
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} -> incoming`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Hardware Maintenance Request System API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
