import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtVerify, createRemoteJWKSet, decodeProtectedHeader } from 'jose';
import { SupabaseJwtPayload } from './auth.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private jwks: ReturnType<typeof createRemoteJWKSet>;
  private hs256Secret?: string;

  constructor(private readonly config: ConfigService) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error(
        'SUPABASE_URL is not defined — set SUPABASE_URL in your environment (.env or container env).',
      );
    }
    this.jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
    this.hs256Secret = this.config.get<string>('SUPABASE_JWT_SECRET');
  }

  async verifyToken(token: string): Promise<SupabaseJwtPayload> {
    if (!token) throw new UnauthorizedException('No token provided');

    const header = decodeProtectedHeader(token);

    if (!header || !header.alg) {
      throw new UnauthorizedException('Invalid token header');
    }

    try {
      const supabaseUrl = this.config
        .get<string>('SUPABASE_URL')
        ?.replace(/\/+$/g, '');
      const issuer = supabaseUrl?.endsWith('/auth/v1')
        ? supabaseUrl
        : `${supabaseUrl}/auth/v1`;

      if (header.alg === 'ES256' || header.alg === 'RS256') {
        const alg = header.alg === 'ES256' ? ['ES256'] : ['RS256'];
        const { payload } = await jwtVerify(token, this.jwks, {
          issuer,
          algorithms: alg,
        });
        if (typeof payload !== 'object' || payload === null) {
          throw new UnauthorizedException('Invalid token payload');
        }
        return payload as unknown as SupabaseJwtPayload;
      } else if (header.alg === 'HS256' && this.hs256Secret) {
        const key = new TextEncoder().encode(this.hs256Secret);
        const { payload } = await jwtVerify(token, key, {
          issuer,
          algorithms: ['HS256'],
        });
        if (typeof payload !== 'object' || payload === null) {
          throw new UnauthorizedException('Invalid token payload');
        }
        return payload as unknown as SupabaseJwtPayload;
      } else {
        throw new UnauthorizedException('Unsupported token algorithm');
      }
    } catch (err) {
      // Log a short debug message to help diagnose verification failures (no secrets)
      // eslint-disable-next-line no-console
      console.debug('jwtVerify failed:', err?.message ?? err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
