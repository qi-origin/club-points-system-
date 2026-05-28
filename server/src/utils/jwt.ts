import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'club-points-secret-key-change-in-production';
const JWT_EXPIRES_IN = '2h';

export function signToken(payload: { id: number; role: 'student' | 'admin' }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { id: number; role: 'student' | 'admin' } {
  return jwt.verify(token, JWT_SECRET) as { id: number; role: 'student' | 'admin' };
}
