export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export interface SupabaseJwtPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;

  email?: string;
  email_verified?: boolean;
  phone?: string | null;

  role: 'authenticated' | 'anon';

  app_metadata: {
    provider: 'email' | 'google' | 'apple';
    providers: string[];
  };

  user_metadata: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export type AuthMethod = 'EMAIL' | 'GOOGLE' | 'APPLE';

export type AuthProvider = 'SUPABASE';
