import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'lumiu-development-secret';
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7; // 7 days

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf8');
}

function sign(message: string) {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(message)
    .digest();
}

export function createJwt(payload: Record<string, unknown>) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
  const body = base64UrlEncode(JSON.stringify({ ...payload, exp }));
  const signature = base64UrlEncode(sign(`${header}.${body}`));
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token: string) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = base64UrlEncode(sign(`${header}.${body}`));
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    if (payload.exp && typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000)) {
      return payload;
    }
  } catch {
    return null;
  }

  return null;
}
