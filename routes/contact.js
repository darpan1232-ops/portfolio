const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact.js');

// @route   POST api/contact
// @desc    Send email and save to DB
// @access  Public
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message cannot be empty'),
], async (req, res) => {
  // 1. Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array() 
    });
  }

  const { name, email, phone, message } = req.body;

  try {
    // 2. Save to MongoDB (optional - only if MongoDB is configured)
    if (process.env.MONGO_URI) {
      try {
        const newContact = new Contact({
          name,
          email,
          phone: phone || undefined,
          subject: 'General', // Default subject since form doesn't have it
          message,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent')
        });
        await newContact.save();
      } catch (dbError) {
        console.error('Database save error (continuing with email):', dbError);
        // Continue even if DB save fails
      }
    }

    // 3. Configure Nodemailer Transporter
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Email service not configured. Please contact the administrator.' 
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter configuration
    await transporter.verify();

    // 4. Email Options
    const recipientEmail = process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER;
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `New Portfolio Inquiry from ${name}`,
      text: `
        You have a new contact form submission:
        
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        
        Message:
        ${message}
        
        Sent at: ${new Date().toLocaleString()}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #64ffda; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    // 5. Send Email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully from ${name} (${email})`);

    res.status(200).json({ 
      success: true, 
      message: 'Your inquiry has been sent successfully!' 
    });

  } catch (error) {
    console.error('Contact Error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Server error. Could not send email.';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please try again later.';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

module.exports = router;