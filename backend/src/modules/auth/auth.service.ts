import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtVerify, createRemoteJWKSet, decodeProtectedHeader } from 'jose';
import { SupabaseJwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  private jwks = createRemoteJWKSet(
    new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
  );

  private hs256Secret = process.env.SUPABASE_JWT_SECRET;

  async verifyToken(token: string): Promise<SupabaseJwtPayload> {
    if (!token) throw new UnauthorizedException('No token provided');

    const header = decodeProtectedHeader(token);

    if (!header || !header.alg) {
      throw new UnauthorizedException('Invalid token header');
    }

    try {
      if (header.alg === 'ES256' || header.alg === 'RS256') {
        const alg = header.alg === 'ES256' ? ['ES256'] : ['RS256'];
        const { payload } = await jwtVerify(token, this.jwks, {
          issuer: `${process.env.SUPABASE_URL}`,
          algorithms: alg,
        });
        return payload as unknown as SupabaseJwtPayload;
      } else if (header.alg === 'HS256' && this.hs256Secret) {
        const key = new TextEncoder().encode(this.hs256Secret);
        const { payload } = await jwtVerify(token, key, {
          issuer: `${process.env.SUPABASE_URL}`,
          algorithms: ['HS256'],
        });
        return payload as unknown as SupabaseJwtPayload;
      } else {
        throw new UnauthorizedException('Unsupported token algorithm');
      }
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
