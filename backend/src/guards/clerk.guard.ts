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
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (typeof authHeader !== 'string' || !authHeader) {
      throw new UnauthorizedException('No Authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.clerk.verifyToken(token);

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      req.auth = {
        clerkUserId: payload.sub,
        sessionId: payload.sid,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
