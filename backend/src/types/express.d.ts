import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    // Add `user` to Express Request (used by auth guards)
    interface Request {
      user?: JwtPayload | { sub: string };
    }
  }
}

export {};
