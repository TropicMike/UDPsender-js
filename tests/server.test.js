jest.mock('../src/udpClient');
const { sendUDPMessage } = require('../src/udpClient');
const request = require('supertest');
const app = require('../server');

const VALID_BODY = { message: 'lights_on', ip: '192.168.1.1', port: 8080 };

describe('POST /api/send-udp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful send', () => {
    it('returns 200 with success response', async () => {
      sendUDPMessage.mockResolvedValue(9);
      const res = await request(app).post('/api/send-udp').send(VALID_BODY);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/sent/i);
    });

    it('includes bytesSent in response details', async () => {
      sendUDPMessage.mockResolvedValue(9);
      const res = await request(app).post('/api/send-udp').send(VALID_BODY);

      expect(res.body.details.bytesSent).toBe(9);
      expect(res.body.details.ip).toBe('192.168.1.1');
      expect(res.body.details.port).toBe(8080);
    });

    it('calls sendUDPMessage with the provided values', async () => {
      sendUDPMessage.mockResolvedValue(9);
      await request(app).post('/api/send-udp').send(VALID_BODY);

      expect(sendUDPMessage).toHaveBeenCalledWith('lights_on', '192.168.1.1', 8080);
    });
  });

  describe('input validation', () => {
    it('returns 400 for an invalid IP address', async () => {
      const res = await request(app)
        .post('/api/send-udp')
        .send({ ...VALID_BODY, ip: '999.999.999.999' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(sendUDPMessage).not.toHaveBeenCalled();
    });

    it('returns 400 for port 0', async () => {
      const res = await request(app)
        .post('/api/send-udp')
        .send({ ...VALID_BODY, port: 0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for port above 65535', async () => {
      const res = await request(app)
        .post('/api/send-udp')
        .send({ ...VALID_BODY, port: 65536 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for an empty message', async () => {
      const res = await request(app)
        .post('/api/send-udp')
        .send({ ...VALID_BODY, message: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for a whitespace-only message', async () => {
      const res = await request(app)
        .post('/api/send-udp')
        .send({ ...VALID_BODY, message: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when message is missing', async () => {
      const { message: _m, ...body } = VALID_BODY;
      const res = await request(app).post('/api/send-udp').send(body);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for a message exceeding 1024 bytes', async () => {
      const res = await request(app)
        .post('/api/send-udp')
        .send({ ...VALID_BODY, message: 'a'.repeat(1025) });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('UDP send failure', () => {
    it('returns 500 when sendUDPMessage throws', async () => {
      sendUDPMessage.mockRejectedValue(new Error('Network failure'));
      const res = await request(app).post('/api/send-udp').send(VALID_BODY);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
