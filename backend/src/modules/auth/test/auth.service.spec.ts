import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(() => jest.fn()),
  decodeProtectedHeader: jest.fn(),
}));

import { jwtVerify, decodeProtectedHeader } from 'jose';

describe('AuthService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws when SUPABASE_URL is missing', () => {
    const config = { get: () => undefined } as unknown as ConfigService;
    expect(() => new AuthService(config)).toThrow(
      'SUPABASE_URL is not defined',
    );
  });

  it('verifies ES256 token using JWKS', async () => {
    const config = {
      get: (k: string) =>
        k === 'SUPABASE_URL' ? 'https://supabase.co' : undefined,
    } as unknown as ConfigService;
    const payload = { sub: 's1', role: 'authenticated' } as any;

    (decodeProtectedHeader as jest.Mock).mockReturnValue({ alg: 'ES256' });
    (jwtVerify as jest.Mock).mockResolvedValue({ payload });

    const svc = new AuthService(config);
    const res = await svc.verifyToken('token');

    expect(jwtVerify).toHaveBeenCalled();
    expect(res).toEqual(payload);
  });

  it('falls back to HS256 when header specifies HS256 and secret provided', async () => {
    const config = {
      get: (k: string) =>
        k === 'SUPABASE_URL'
          ? 'https://supabase.co'
          : k === 'SUPABASE_JWT_SECRET'
            ? 'secret'
            : undefined,
    } as unknown as ConfigService;
    const payload = { sub: 's2' } as any;

    (decodeProtectedHeader as jest.Mock).mockReturnValue({ alg: 'HS256' });
    (jwtVerify as jest.Mock).mockResolvedValue({ payload });

    const svc = new AuthService(config);
    const res = await svc.verifyToken('token');

    expect(jwtVerify).toHaveBeenCalled();
    expect(res).toEqual(payload);
  });

  it('throws UnauthorizedException for unsupported algorithms', async () => {
    const config = {
      get: (k: string) =>
        k === 'SUPABASE_URL' ? 'https://supabase.co' : undefined,
    } as unknown as ConfigService;
    (decodeProtectedHeader as jest.Mock).mockReturnValue({
      alg: 'UNSUPPORTED',
    });

    const svc = new AuthService(config);
    await expect(svc.verifyToken('token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
