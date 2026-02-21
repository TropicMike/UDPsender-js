/**
 * Validates IPv4 address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IPv4 format
 */
function validateIP(ip) {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

/**
 * Validates port number
 * @param {number} port - Port number to validate
 * @returns {boolean} True if valid port (1-65535)
 */
function validatePort(port) {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

/**
 * Validates message content
 * @param {string} message - Message to validate
 * @returns {boolean} True if valid message
 */
function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  // Check if message is non-empty and not too large
  const messageBytes = Buffer.byteLength(message, 'utf8');
  return message.trim().length > 0 && messageBytes <= 1024;
}

/**
 * Validates all input parameters
 * @param {string} message - Message to send
 * @param {string} ip - Target IP address
 * @param {number} port - Target port
 * @returns {object} Validation result with valid flag and error message
 */
function validateInput(message, ip, port) {
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

module.exports = {
  validateIP,
  validatePort,
  validateMessage,
  validateInput
};
