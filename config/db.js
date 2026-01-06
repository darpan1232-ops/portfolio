const mongoose = require('mongoose');

const connectDB = async () => {
  // Skip MongoDB connection if URI is not provided
  if (!process.env.MONGO_URI) {
    console.log('MongoDB URI not provided. Skipping database connection. (Contact submissions will still be sent via email)');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Server will continue without database connection. (Contact submissions will still be sent via email)');
    // Don't exit process - allow server to run without DB
  }
};

module.exports = connectDB;