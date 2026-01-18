/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ProfileService } from '../profile.service';
import { PrismaService } from 'nestjs-prisma';
import { SupabaseJwtPayload } from '../../auth/auth.types';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: Partial<PrismaService>;

  beforeEach(() => {
    prisma = {
      authIdentity: {
        findUnique: jest.fn(),
        create: jest.fn(),
      } as any,
      $transaction: jest.fn(),
    } as any;

    service = new ProfileService(prisma as any);
  });

  it('returns existing user when auth identity exists', async () => {
    const user = { id: 'u1', email: 'existing@example.com' };
    (prisma.authIdentity!.findUnique as jest.Mock).mockResolvedValue({ user });

    const payload = { sub: 'sub-existing' } as unknown as SupabaseJwtPayload;
    const result = await service.getOrCreate(payload);

    expect(result).toBe(user);
    expect(prisma.authIdentity!.findUnique).toHaveBeenCalledWith({
      where: {
        provider_providerUserId: {
          provider: 'SUPABASE',
          providerUserId: payload.sub,
        },
      },
      include: { user: true },
    });
  });

  it('creates a new user and auth identity when none exists', async () => {
    (prisma.authIdentity!.findUnique as jest.Mock).mockResolvedValue(null);

    const createdUser = {
      id: 'u2',
      email: 'new@example.com',
      firstName: 'First',
      lastName: 'Last',
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      const tx = {
        user: { create: jest.fn().mockResolvedValue(createdUser) },
        authIdentity: { create: jest.fn().mockResolvedValue({}) },
      } as any;
      return cb(tx);
    });

    const payload: SupabaseJwtPayload = {
      aud: 'authenticated',
      exp: Date.now() + 1000,
      iat: Date.now(),
      iss: 'https://example.supabase.co/auth/v1',
      sub: 'sub-new',
      email: 'new@example.com',
      role: 'authenticated',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { first_name: 'First', last_name: 'Last' },
      amr: [{ method: 'password' }],
    } as any;

    const result = await service.getOrCreate(payload);

    expect(result).toEqual(createdUser);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
