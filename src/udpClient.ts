import * as dgram from 'dgram';

function sendUDPMessage(message: string, ip: string, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    const buffer = Buffer.from(message);

    const timeout = setTimeout(() => {
      client.close();
      reject(new Error('UDP send operation timed out'));
    }, 5000);

    client.send(buffer, 0, buffer.length, port, ip, (error, bytes) => {
      clearTimeout(timeout);
      client.close();

      if (error) {
        reject(error);
      } else {
        resolve(bytes);
      }
    });

    client.on('error', (error) => {
      clearTimeout(timeout);
      client.close();
      reject(error);
    });
  });
}

export { sendUDPMessage };
