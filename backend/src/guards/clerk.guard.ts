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
    jwtKey: process.env.CLERK_JWT_KEY,
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('🔐 ClerkAuthGuard: Guard activated');
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    this.logger.debug(
      `🔐 ClerkAuthGuard: Auth header present: ${!!authHeader}`,
    );

    if (!authHeader || typeof authHeader !== 'string') {
      this.logger.warn('🔐 ClerkAuthGuard: No Authorization header');
      throw new UnauthorizedException('No Authorization header');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
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
      // If JWK fetch fails and CLERK_JWT_KEY is not set, log more info
      if (err?.reason === 'jwk-failed-to-resolve') {
        this.logger.error(
          `🔐 ClerkAuthGuard: JWK resolution failed. Make sure CLERK_JWT_KEY is set in prod.`,
        );
      }

      this.logger.warn(
        `🔐 ClerkAuthGuard: Token verification failed: ${err?.message ?? err}`,
        err,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
