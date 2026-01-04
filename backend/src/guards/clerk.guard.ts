import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerk = createClerkClient({ secretKey: process.env.CLERK_API_KEY! });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (typeof authHeader !== 'string' || !authHeader) {
      throw new UnauthorizedException('No Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const session = await this.clerk.sessions.getSession(token);
      if (!session) throw new UnauthorizedException('Invalid token');
      const user = await this.clerk.users.getUser(session.userId);
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
