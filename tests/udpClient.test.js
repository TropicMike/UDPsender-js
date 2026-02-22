jest.mock('dgram');
const dgram = require('dgram');
const { sendUDPMessage } = require('../src/udpClient');

describe('sendUDPMessage', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      send: jest.fn(),
      close: jest.fn(),
      on: jest.fn(),
    };
    dgram.createSocket.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('creates a UDP4 socket', async () => {
    mockSocket.send.mockImplementation((buf, offset, length, port, ip, cb) => cb(null, buf.length));
    await sendUDPMessage('hello', '192.168.1.1', 8080);
    expect(dgram.createSocket).toHaveBeenCalledWith('udp4');
  });

  it('resolves with the number of bytes sent', async () => {
    mockSocket.send.mockImplementation((buf, offset, length, port, ip, cb) => cb(null, buf.length));
    const bytes = await sendUDPMessage('hello', '192.168.1.1', 8080);
    expect(bytes).toBe(5); // 'hello' = 5 bytes
  });

  it('sends to the correct host and port', async () => {
    mockSocket.send.mockImplementation((buf, offset, length, port, ip, cb) => cb(null, buf.length));
    await sendUDPMessage('test', '10.0.0.1', 9000);
    expect(mockSocket.send).toHaveBeenCalledWith(
      expect.any(Buffer), 0, 4, 9000, '10.0.0.1', expect.any(Function)
    );
  });

  it('closes the socket after a successful send', async () => {
    mockSocket.send.mockImplementation((buf, offset, length, port, ip, cb) => cb(null, buf.length));
    await sendUDPMessage('hello', '192.168.1.1', 8080);
    expect(mockSocket.close).toHaveBeenCalledTimes(1);
  });

  it('rejects when the send callback receives an error', async () => {
    const sendError = new Error('ECONNREFUSED');
    mockSocket.send.mockImplementation((buf, offset, length, port, ip, cb) => cb(sendError, 0));
    await expect(sendUDPMessage('hello', '192.168.1.1', 8080)).rejects.toThrow('ECONNREFUSED');
    expect(mockSocket.close).toHaveBeenCalledTimes(1);
  });

  it('rejects when a socket error event fires', async () => {
    let errorHandler;
    mockSocket.on.mockImplementation((event, handler) => {
      if (event === 'error') errorHandler = handler;
    });
    mockSocket.send.mockImplementation(() => {}); // never calls callback

    const promise = sendUDPMessage('hello', '192.168.1.1', 8080);
    errorHandler(new Error('Socket error'));
    await expect(promise).rejects.toThrow('Socket error');
    expect(mockSocket.close).toHaveBeenCalledTimes(1);
  });

  it('rejects with a timeout error after 5 seconds', async () => {
    jest.useFakeTimers();
    mockSocket.send.mockImplementation(() => {}); // never calls callback

    const promise = sendUDPMessage('hello', '192.168.1.1', 8080);
    jest.advanceTimersByTime(5001);
    await expect(promise).rejects.toThrow('timed out');
    expect(mockSocket.close).toHaveBeenCalledTimes(1);
  });
});
