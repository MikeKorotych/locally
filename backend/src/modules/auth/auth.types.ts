import { JwtPayload } from 'jsonwebtoken';

export interface SupabaseUser extends JwtPayload {
  sub: string;
  email?: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}
