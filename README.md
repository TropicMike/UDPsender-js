# UDPsender-js

A lightweight web-based application for sending UDP messages to control network devices. Built with Express.js backend and vanilla JavaScript frontend.

## Features

- 🚀 Simple web interface for sending UDP messages
- ⚡ Quick action buttons for predefined commands
- 💾 Persistent settings (IP and port stored in localStorage)
- 🔒 Built-in security with rate limiting and input validation
- 🎯 Real-time feedback on message delivery
- 📱 Responsive design for desktop and mobile

## Installation

### Prerequisites

- Node.js (v12 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/UDPsender-js.git
cd UDPsender-js
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:3000`
2. Enter the target device's IP address and port number
3. Either:
   - Click a quick action button (Lights ON/OFF) for predefined commands
   - Enter a custom message and click "Send Custom Message"

Your IP and port settings are automatically saved in your browser.

### Quick Actions

The application includes two predefined quick action buttons:
- **Lights ON**: Sends `lights_on` command
- **Lights OFF**: Sends `lights_off` command

### Custom Messages

Enter any text message (up to 1024 bytes) in the custom message field and click "Send Custom Message" to transmit it via UDP.

## API Documentation

### Send UDP Message

**Endpoint:** `POST /api/send-udp`

**Request Body:**
```json
{
  "message": "your_message_here",
  "ip": "192.168.1.100",
  "port": 8080
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "UDP message sent successfully",
  "details": {
    "bytesSent": 17
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error description"
}
```

**Rate Limit:** 60 requests per minute per IP address

### Input Validation

All inputs are validated on both client and server:

- **IP Address**: Must be valid IPv4 format (e.g., `192.168.1.100`)
- **Port**: Integer between 1 and 65535
- **Message**: Non-empty string, maximum 1024 bytes (UTF-8)

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)

Example:
```bash
PORT=8080 npm start
```

### Validation Constraints

These limits are enforced in `src/validators.js`:

- Maximum message size: 1024 bytes
- UDP send timeout: 5 seconds
- Port range: 1-65535
- IP format: IPv4 only

## Security Features

The application implements multiple security layers:

- **Helmet.js**: Secure HTTP headers
- **CORS**: Cross-Origin Resource Sharing enabled
- **Rate Limiting**: 60 requests per minute per IP on `/api/*` routes
- **Double Validation**: Both frontend and backend validate all inputs
- **Timeout Protection**: UDP operations timeout after 5 seconds
- **Input Sanitization**: All user inputs are validated and sanitized

## Development

### Development Mode

Run the server with auto-reload on file changes:
```bash
npm run dev
```

### Project Structure

```
UDPsender-js/
├── server.js              # Express server with security middleware
├── src/
│   ├── udpClient.js      # UDP socket wrapper with Promise-based API
│   └── validators.js     # Shared validation logic
├── public/
│   ├── index.html        # Frontend UI
│   ├── app.js           # Frontend JavaScript logic
│   └── styles.css       # Styling
└── package.json          # Project dependencies
```

### Key Files

- **server.js**: Express server setup with API endpoint and security middleware
- **src/udpClient.js**: UDP socket implementation using Node's dgram module
- **src/validators.js**: Input validation shared between frontend and backend
- **public/app.js**: Frontend logic with localStorage persistence
- **public/index.html**: User interface with quick actions and custom message input

### Architecture

**Backend Flow:**
1. Express receives POST request at `/api/send-udp`
2. Rate limiter checks request frequency
3. Input validation ensures data integrity
4. UDP client sends message with 5-second timeout
5. Response returned with success status and bytes sent

**Frontend:**
- Client-side validation mirrors backend rules
- Settings persist to localStorage
- Fetch API communicates with backend
- Real-time status updates

## UDP Behavior

UDP (User Datagram Protocol) is a connectionless protocol:
- Messages are "fire-and-forget" with no delivery guarantee
- Success response only indicates the packet was sent to the network stack
- No confirmation that the target device received the message
- A new socket is created for each message transmission

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Use a different port
PORT=3001 npm start
```

**UDP messages not reaching target device:**
- Verify the target IP address and port are correct
- Check firewall settings on both sender and receiver
- Ensure the target device is listening on the specified UDP port
- Remember: UDP provides no delivery confirmation

**Rate limit errors:**
- The API limits requests to 60 per minute per IP
- Wait a minute and try again
- Consider implementing queuing for high-frequency scenarios

## Support

For issues and questions, please open an issue on the GitHub repository.