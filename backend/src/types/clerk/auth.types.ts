import { Request } from 'express';

export interface AuthContext {
  clerkUserId: string;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}
