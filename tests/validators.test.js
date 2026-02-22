const { validateIP, validatePort, validateMessage, validateInput } = require('../src/validators');

describe('validateIP', () => {
  it('accepts valid IPv4 addresses', () => {
    expect(validateIP('192.168.1.1')).toBe(true);
    expect(validateIP('0.0.0.0')).toBe(true);
    expect(validateIP('255.255.255.255')).toBe(true);
    expect(validateIP('10.0.0.1')).toBe(true);
    expect(validateIP('172.16.0.1')).toBe(true);
  });

  it('rejects out-of-range octets', () => {
    expect(validateIP('256.0.0.1')).toBe(false);
    expect(validateIP('192.168.1.300')).toBe(false);
  });

  it('rejects incomplete addresses', () => {
    expect(validateIP('192.168.1')).toBe(false);
    expect(validateIP('192.168')).toBe(false);
    expect(validateIP('192')).toBe(false);
  });

  it('rejects addresses with extra octets', () => {
    expect(validateIP('192.168.1.1.1')).toBe(false);
  });

  it('rejects addresses with port notation', () => {
    expect(validateIP('192.168.1.1:80')).toBe(false);
  });

  it('rejects IPv6 addresses', () => {
    expect(validateIP('::1')).toBe(false);
    expect(validateIP('2001:db8::1')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(validateIP('abc.def.ghi.jkl')).toBe(false);
    expect(validateIP('localhost')).toBe(false);
  });

  it('rejects empty and null', () => {
    expect(validateIP('')).toBe(false);
    expect(validateIP(null)).toBe(false);
    expect(validateIP(undefined)).toBe(false);
  });
});

describe('validatePort', () => {
  it('accepts valid port numbers', () => {
    expect(validatePort(1)).toBe(true);
    expect(validatePort(80)).toBe(true);
    expect(validatePort(3000)).toBe(true);
    expect(validatePort(65535)).toBe(true);
  });

  it('accepts port as string', () => {
    expect(validatePort('8080')).toBe(true);
    expect(validatePort('1')).toBe(true);
    expect(validatePort('65535')).toBe(true);
  });

  it('rejects out-of-range values', () => {
    expect(validatePort(0)).toBe(false);
    expect(validatePort(65536)).toBe(false);
    expect(validatePort(-1)).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(validatePort('abc')).toBe(false);
    expect(validatePort(null)).toBe(false);
    expect(validatePort(undefined)).toBe(false);
  });
});

describe('validateMessage', () => {
  it('accepts normal messages', () => {
    expect(validateMessage('hello')).toBe(true);
    expect(validateMessage('lights_on')).toBe(true);
    expect(validateMessage('a')).toBe(true);
  });

  it('accepts a message of exactly 1024 bytes', () => {
    expect(validateMessage('a'.repeat(1024))).toBe(true);
  });

  it('rejects a message exceeding 1024 bytes', () => {
    expect(validateMessage('a'.repeat(1025))).toBe(false);
  });

  it('enforces byte count, not character count, for multi-byte characters', () => {
    // 'é' (U+00E9) is 2 bytes in UTF-8
    expect(validateMessage('\u00e9'.repeat(512))).toBe(true);  // exactly 1024 bytes
    expect(validateMessage('\u00e9'.repeat(513))).toBe(false); // 1026 bytes
  });

  it('rejects empty string', () => {
    expect(validateMessage('')).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(validateMessage('   ')).toBe(false);
    expect(validateMessage('\t\n')).toBe(false);
  });

  it('rejects null and undefined', () => {
    expect(validateMessage(null)).toBe(false);
    expect(validateMessage(undefined)).toBe(false);
  });
});

describe('validateInput', () => {
  it('returns valid for correct inputs', () => {
    expect(validateInput('lights_on', '192.168.1.1', 8080)).toEqual({ valid: true });
  });

  it('returns error for invalid message', () => {
    const result = validateInput('', '192.168.1.1', 8080);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/message/i);
  });

  it('returns error for invalid IP', () => {
    const result = validateInput('hello', '999.999.999.999', 8080);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/ip/i);
  });

  it('returns error for invalid port', () => {
    const result = validateInput('hello', '192.168.1.1', 0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/port/i);
  });

  it('validates message before IP before port', () => {
    // All invalid — should report message error first
    const result = validateInput('', 'bad-ip', 0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/message/i);
  });
});
