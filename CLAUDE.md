# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UDPsender-js is a web-based application that sends UDP messages to control network devices. It consists of an Express.js backend server (TypeScript) and a vanilla TypeScript frontend compiled to a plain global-scope script.

## Development Commands

- `npm run build` - Compile both backend and frontend TypeScript
- `npm run build:server` - Compile backend only (`src/` → `dist/`)
- `npm run build:client` - Compile frontend only (`client/` → `public/app.js`)
- `npm start` - Run production server from `dist/server.js` (port 3000 by default)
- `npm run dev` - Run development server with nodemon + ts-node (watches `src/*.ts`)
- `npm run dev:client` - Watch and recompile frontend TypeScript
- `npm run typecheck` - Type-check both projects without emitting files
- `npm install` - Install dependencies

The server will be available at `http://localhost:3000` (or PORT environment variable if set).

## Environment Variables

- `PORT` - Server port (default: 3000)
  - Example: `PORT=8080 npm start`

## Architecture

### Backend Flow (src/server.ts → src/udpClient.ts)
1. Express server receives POST request at `/api/send-udp` with `{ message, ip, port }`
2. Request passes through rate limiter (60 req/min per IP)
3. Input validation via `validators.validateInput()` checks:
   - Message: non-empty, ≤1024 bytes
   - IP: valid IPv4 format
   - Port: 1-65535 range
4. `udpClient.sendUDPMessage()` creates dgram socket, sends message with 5-second timeout
5. Response returns `{ success, message, details: { bytesSent } }`

### Frontend (client/app.ts → public/app.js)
- `client/app.ts` is compiled with `module: "None"` to produce a plain global-scope `public/app.js`
- `public/app.js` is a generated file — edit `client/app.ts` instead
- Client-side validation mirrors backend validation
- Settings (IP/port) persist to localStorage
- Fetch API calls `/api/send-udp` endpoint
- Quick action buttons send predefined messages (`lights_on`, `lights_off`)

### Security Layers
- **helmet**: Secure HTTP headers
- **cors**: CORS enabled for cross-origin requests
- **express-rate-limit**: 60 requests per minute per IP on `/api/*` routes
- **Double validation**: Both frontend and backend validate all inputs
- **Timeout protection**: UDP send operations timeout after 5 seconds

## Key Files

- `src/server.ts` - Express server with security middleware and API endpoint
- `src/udpClient.ts` - UDP socket wrapper using Node's dgram, Promise-based with timeout
- `src/validators.ts` - Backend validation logic (IPv4, port, message size)
- `src/types.ts` - Shared TypeScript interfaces (SendUDPRequest, ValidationResult, etc.)
- `client/app.ts` - Frontend TypeScript source with localStorage persistence
- `public/app.js` - Generated frontend script (do not edit directly)
- `public/index.html` - UI with quick actions and custom message input
- `public/styles.css` - Frontend styling and responsive design
- `dist/` - Generated backend output (do not edit directly)

## Important Constraints

- **Message size limit**: 1024 bytes (enforced in validators.ts)
- **UDP timeout**: 5 seconds per send operation
- **Port range**: 1-65535 only
- **IP format**: IPv4 only (no IPv6 support)
- **Rate limit**: 60 requests/minute per IP address

## Validation Logic

Validation exists in both `src/validators.ts` (backend) and `client/app.ts` (frontend) and must remain synchronized:

- **IPv4 regex**: `/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/`
- **Port**: Integer between 1-65535
- **Message**: Non-empty string, max 1024 bytes in UTF-8

When modifying validation rules, update both locations.

## UDP Socket Behavior

The `sendUDPMessage()` function in `src/udpClient.ts`:
- Creates a new UDP4 socket for each message (fire-and-forget pattern)
- Sets a 5-second timeout to prevent hanging
- Closes socket after send completes or errors
- Returns Promise resolving to bytes sent on success

UDP is connectionless, so "success" only means the packet was sent to the network stack, not that it was received by the target device.
