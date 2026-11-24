import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fiesta_rsvp_super_secret_jwt_key_2026';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  try {
    const key = crypto.scryptSync(password, salt, 64);
    const storedKey = Buffer.from(hash, 'hex');
    return crypto.timingSafeEqual(key, storedKey);
  } catch (err) {
    return false;
  }
}

export function createToken(payload, expiresInHours = 48) {
  const exp = Date.now() + expiresInHours * 60 * 60 * 1000;
  const data = JSON.stringify({ ...payload, exp });
  const dataB64 = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [dataB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(dataB64).digest('base64url');
  
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Inicia sesión.' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Sesión expirada o inválida. Inicia sesión nuevamente.' });
  }

  req.user = user;
  next();
}
