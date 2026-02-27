# UDPsender-js

A lightweight web-based application for sending UDP messages to control network devices. Built with an Express.js backend and vanilla TypeScript frontend.

## Features

- Simple web interface for sending UDP messages
- Quick action buttons for predefined commands (`lights_on`, `lights_off`)
- Persistent settings (IP and port stored in localStorage)
- Built-in security with rate limiting and input validation
- Real-time feedback on message delivery
- Responsive design for desktop and mobile
- Optional Electron desktop app wrapper

## Installation

### Prerequisites

- Node.js (v16 or higher)
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

3. Build the project:
```bash
npm run build
```

4. Start the server:
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

## Development

### Development Mode

Run the backend with auto-reload on file changes:
```bash
npm run dev
```

Watch and recompile the frontend TypeScript:
```bash
npm run dev:client
```

### Build Commands

| Command | Description |
|---|---|
| `npm run build` | Compile both backend and frontend TypeScript |
| `npm run build:server` | Compile backend only (`src/` → `dist/`) |
| `npm run build:client` | Compile frontend only (`client/` → `public/app.js`) |
| `npm run typecheck` | Type-check both projects without emitting files |

### Project Structure

```
UDPsender-js/
├── src/
│   ├── server.ts          # Express server with security middleware and API endpoint
│   ├── udpClient.ts       # UDP socket wrapper (Promise-based, with timeout)
│   ├── validators.ts      # Input validation logic (IPv4, port, message size)
│   └── types.ts           # Shared TypeScript interfaces
├── client/
│   └── app.ts             # Frontend TypeScript source
├── electron/
│   └── main.ts            # Electron desktop app entry point
├── public/
│   ├── index.html         # Frontend UI
│   ├── app.js             # Generated frontend script (do not edit directly)
│   └── styles.css         # Styling
├── scripts/
│   └── udp-listen.ps1     # PowerShell UDP listener for testing
├── dist/                  # Generated backend output (do not edit directly)
└── package.json
```

## Electron Desktop App

The application can run as a standalone desktop app using Electron. The Electron main process starts the embedded Express server on a free OS-assigned port and opens it in a `BrowserWindow`.

```bash
npm run electron
```

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

## Security Features

- **Helmet.js**: Secure HTTP headers
- **CORS**: Cross-Origin Resource Sharing enabled
- **Rate Limiting**: 60 requests per minute per IP on `/api/*` routes
- **Double Validation**: Both frontend and backend validate all inputs
- **Timeout Protection**: UDP operations timeout after 5 seconds

## UDP Behavior

UDP (User Datagram Protocol) is a connectionless protocol:
- Messages are "fire-and-forget" with no delivery guarantee
- A success response only means the packet was sent to the network stack, not that the target received it
- A new socket is created for each message transmission

## Testing with the UDP Listener

A PowerShell script is included to listen for incoming UDP messages on port 9999, useful for local testing:

```powershell
.\scripts\udp-listen.ps1
```

The script prints the sender address and message content for each packet received.

## Troubleshooting

**Port already in use:**
```bash
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

## License

[MIT License](LICENSE)
