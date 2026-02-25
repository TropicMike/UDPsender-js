import { ValidationResult } from './types';

function validateIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

function validatePort(port: unknown): boolean {
  const portNum = parseInt(String(port), 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

function validateMessage(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const messageBytes = Buffer.byteLength(message, 'utf8');
  return message.trim().length > 0 && messageBytes <= 1024;
}

function validateInput(message: string, ip: string, port: unknown): ValidationResult {
  if (!validateMessage(message)) {
    return {
      valid: false,
      error: 'Invalid message: must be non-empty and less than 1024 bytes'
    };
  }

  if (!validateIP(ip)) {
    return {
      valid: false,
      error: 'Invalid IP address format (expected IPv4, e.g., 192.168.1.100)'
    };
  }

  if (!validatePort(port)) {
    return {
      valid: false,
      error: 'Invalid port number (must be between 1 and 65535)'
    };
  }

  return { valid: true };
}

export { validateIP, validatePort, validateMessage, validateInput };
