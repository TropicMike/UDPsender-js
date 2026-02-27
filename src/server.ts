import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { sendUDPMessage } from './udpClient';
import { validateInput } from './validators';
import { SendUDPRequest } from './types';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting: 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// API endpoint to send UDP messages
app.post('/api/send-udp', async (req, res) => {
  try {
    const { message, ip, port } = req.body as SendUDPRequest;

    const validation = validateInput(message, ip, port);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error
      });
      return;
    }

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
      error: 'Failed to send UDP message: ' + (error as Error).message
    });
  }
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
app.use(errorHandler);

// Start server — PORT=0 lets the OS pick a free port (used by Electron)
export let actualPort: number = typeof PORT === 'string' ? parseInt(PORT, 10) : Number(PORT);

export const serverReady: Promise<void> = new Promise((resolve, reject) => {
  const server = app.listen(PORT, () => {
    const addr = server.address();
    if (addr && typeof addr === 'object') {
      actualPort = addr.port;
    }
    console.log(`UDP Sender server running on http://localhost:${actualPort}`);
    resolve();
  });
  server.on('error', reject);
});
