import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('🔐 ClerkAuthGuard: Guard activated');
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    this.logger.debug(
      `🔐 ClerkAuthGuard: Auth header present: ${!!authHeader}`,
    );
    if (typeof authHeader !== 'string' || !authHeader) {
      this.logger.warn('🔐 ClerkAuthGuard: No Authorization header');
      throw new UnauthorizedException('No Authorization header');
    }

    const token = authHeader.slice(7);
    this.logger.log(
      `🔐 ClerkAuthGuard: Token extracted, length: ${token.length}`,
    );

    try {
      this.logger.log('🔐 ClerkAuthGuard: Verifying token with Clerk...');
      const payload = await this.clerk.verifyToken(token);

      if (!payload?.sub) {
        this.logger.warn(
          '🔐 ClerkAuthGuard: Invalid token payload (missing sub)',
        );
        throw new UnauthorizedException('Invalid token payload');
      }

      this.logger.log(
        `🔐 ClerkAuthGuard: Token verified, payload: ${JSON.stringify({
          sub: payload.sub,
          sid: payload.sid,
          iat: payload.iat,
          exp: payload.exp,
        })}`,
      );
      req.auth = {
        clerkUserId: payload.sub,
        sessionId: payload.sid,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      };
      this.logger.log(
        `🔐 ClerkAuthGuard: Auth attached to request for user ${payload.sub}`,
      );

      return true;
    } catch (err: any) {
      this.logger.warn(
        `🔐 ClerkAuthGuard: Token verification failed: ${err?.message ?? err}`,
        err,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
