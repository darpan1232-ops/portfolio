require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contact');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Connect to MongoDB (optional - only if MONGO_URI is set)
if (process.env.MONGO_URI) {
  connectDB();
}

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Apply rate limiting to contact route
app.use('/api/contact', rateLimiter);

// Routes
app.use('/api/contact', contactRoutes);

// --- HOMEPAGE ROUTE ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});