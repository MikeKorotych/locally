import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('🔐 ClerkAuthGuard: Guard activated');
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    console.log(
      '🔐 ClerkAuthGuard: Auth header:',
      typeof authHeader === 'string' && authHeader
        ? `Bearer ${authHeader.substring(7, 20)}...`
        : 'NOT FOUND',
    );

    if (typeof authHeader !== 'string' || !authHeader) {
      console.log('🔐 ClerkAuthGuard: No authorization header');
      throw new UnauthorizedException('No Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 ClerkAuthGuard: Token extracted, length:', token.length);

    try {
      console.log('🔐 ClerkAuthGuard: Verifying token with Clerk...');
      // Verify JWT token instead of getting session
      const payload = await this.clerk.verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      console.log('🔐 ClerkAuthGuard: Token verified, payload:', payload);

      if (!payload || !payload.sub) {
        console.log('🔐 ClerkAuthGuard: Invalid payload or missing sub');
        throw new UnauthorizedException('Invalid token');
      }

      console.log('🔐 ClerkAuthGuard: Fetching user:', payload.sub);
      // Fetch user data using userId from token
      const user = await this.clerk.users.getUser(payload.sub);
      console.log('🔐 ClerkAuthGuard: User fetched successfully:', user.id);
      req.user = user;
      return true;
    } catch (error) {
      console.error('🔐 ClerkAuthGuard: Token verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
