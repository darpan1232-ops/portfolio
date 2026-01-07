const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    default: 'General',
    enum: ['General', 'Support', 'Sales', 'Other']
  },
  /** The reason for enum is very simple : yo vneko certain amount of value matra allowed vaneko here we see 4 option so they are only allowed. */
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    trim: true
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);