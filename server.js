const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sendUDPMessage } = require('./src/udpClient');
const { validateInput } = require('./src/validators');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting: 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to send UDP messages
app.post('/api/send-udp', async (req, res) => {
  try {
    const { message, ip, port } = req.body;

    // Validate input
    const validation = validateInput(message, ip, port);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Send UDP message
    const bytesSent = await sendUDPMessage(message, ip, port);

    res.json({
      success: true,
      message: 'UDP message sent successfully',
      details: {
        message,
        ip,
        port,
        bytesSent
      }
    });
  } catch (error) {
    console.error('Error sending UDP message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send UDP message: ' + error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`UDP Sender server running on http://localhost:${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});
