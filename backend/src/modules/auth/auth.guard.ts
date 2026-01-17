import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { SupabaseUser } from './auth.types';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string')
      throw new UnauthorizedException('No token');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token');

    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!secret) throw new UnauthorizedException('Auth not configured');

    try {
      const payload = verify(token, secret);

      if (typeof payload === 'string') {
        req.user = { sub: payload };
      } else if (typeof payload === 'object' && payload !== null) {
        req.user = payload as SupabaseUser;
      } else {
        throw new UnauthorizedException('Invalid token payload');
      }
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
