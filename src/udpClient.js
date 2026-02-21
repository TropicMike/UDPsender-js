const dgram = require('dgram');

/**
 * Sends a UDP message to the specified IP address and port
 * @param {string} message - The message to send
 * @param {string} ip - Target IP address
 * @param {number} port - Target port number
 * @returns {Promise<number>} Number of bytes sent
 */
function sendUDPMessage(message, ip, port) {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    const buffer = Buffer.from(message);

    // Set a timeout for the send operation
    const timeout = setTimeout(() => {
      client.close();
      reject(new Error('UDP send operation timed out'));
    }, 5000); // 5 second timeout

    client.send(buffer, 0, buffer.length, port, ip, (error, bytes) => {
      clearTimeout(timeout);
      client.close();

      if (error) {
        reject(error);
      } else {
        resolve(bytes);
      }
    });

    // Handle socket errors
    client.on('error', (error) => {
      clearTimeout(timeout);
      client.close();
      reject(error);
    });
  });
}

module.exports = { sendUDPMessage };
