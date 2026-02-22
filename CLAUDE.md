# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UDPsender-js is a web-based application that sends UDP messages to control network devices. It consists of an Express.js backend server and a vanilla JavaScript frontend.

## Development Commands

- `npm start` - Run production server (listens on port 3000 by default)
- `npm run dev` - Run development server with nodemon for auto-reload
- `npm install` - Install dependencies

The server will be available at `http://localhost:3000` (or `PORT` env var if set).

**Note:** This project has no test suite and no linter configured.

## Architecture

### Backend Flow (server.js → src/udpClient.js)
1. Express server receives POST at `/api/send-udp` with `{ message, ip, port }`
2. Rate limiter (60 req/min per IP) via `express-rate-limit` on all `/api/*` routes
3. `validators.validateInput()` checks: message non-empty ≤1024 bytes UTF-8, valid IPv4, port 1-65535
4. `udpClient.sendUDPMessage()` creates a new `dgram` UDP4 socket per message with 5-second timeout
5. Response returns `{ success, message, details: { bytesSent } }`

UDP is connectionless — "success" only confirms the packet reached the OS network stack, not that the target received it.

### Frontend (public/app.js)
- Client-side validation mirrors backend validation before calling the API
- Settings (IP/port) persist to `localStorage` under keys `udp_ip` / `udp_port`
- Quick action buttons send predefined string messages (`lights_on`, `lights_off`)

### Security Middleware (server.js)
- `helmet` for secure HTTP headers
- `cors` enabled globally
- `express-rate-limit` on `/api/*`

## Validation — Keep Frontend and Backend in Sync

Validation logic is duplicated in `src/validators.js` (backend) and `public/app.js` (frontend). Both must be updated together when rules change.

**Known discrepancy:** The frontend checks `message.length <= 1024` (character count), while the backend checks `Buffer.byteLength(message, 'utf8') <= 1024` (byte count). For multi-byte UTF-8 characters, a message can pass frontend validation but be rejected by the backend.

- **IPv4 regex**: `/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/`
- **Port**: integer 1–65535
- **Message**: non-empty, ≤1024 bytes (UTF-8) — IPv6 not supported
