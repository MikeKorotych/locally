/* eslint-disable @typescript-eslint/no-unsafe-return */
import { SupabaseAuthGuard } from '../auth.guard';
import { UnauthorizedException } from '@nestjs/common';

function makeContext(req: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as any;
}

describe('SupabaseAuthGuard', () => {
  it('throws UnauthorizedException when Authorization header missing', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as any;
    const guard = new SupabaseAuthGuard({} as any, reflector);
    const ctx = makeContext({ headers: {} });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for non-Bearer header', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as any;
    const guard = new SupabaseAuthGuard({} as any, reflector);
    const ctx = makeContext({ headers: { authorization: 'Token abc' } });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches user and returns true for valid token', async () => {
    const user = { sub: 'u1' };
    const authService = {
      verifyToken: jest.fn().mockResolvedValue(user),
    } as any;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as any;
    const guard = new SupabaseAuthGuard(authService, reflector);

    const req: any = { headers: { authorization: 'Bearer token' } };
    const ctx = makeContext(req);

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(req.user).toBe(user);
    expect(authService.verifyToken).toHaveBeenCalledWith('token');
  });

  it('throws UnauthorizedException for invalid token', async () => {
    const authService = {
      verifyToken: jest.fn().mockRejectedValue(new Error('bad')),
    } as any;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as any;
    const guard = new SupabaseAuthGuard(authService, reflector);

    const ctx = makeContext({ headers: { authorization: 'Bearer badtoken' } });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
