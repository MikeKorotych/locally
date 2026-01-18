import { ProfileController } from '../profile.controller';
import { ProfileService } from '../profile.service';
import { SupabaseJwtPayload } from '../../auth/auth.types';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: Partial<ProfileService>;

  beforeEach(() => {
    profileService = {
      getOrCreate: jest.fn(),
    } as Partial<ProfileService>;

    controller = new ProfileController(profileService as any);
  });

  it('returns the user from ProfileService.getOrCreate', async () => {
    const payload: SupabaseJwtPayload = {
      aud: 'authenticated',
      exp: Date.now() + 1000,
      iat: Date.now(),
      iss: 'https://example.supabase.co/auth/v1',
      sub: 'sub-123',
      email: 'user@example.com',
      role: 'authenticated',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
    } as any;

    const expectedUser = { id: 'u1', email: payload.email };
    (profileService.getOrCreate as jest.Mock).mockResolvedValue(expectedUser);

    await expect(controller.profile(payload)).resolves.toEqual(expectedUser);
    expect(profileService.getOrCreate).toHaveBeenCalledWith(payload);
  });
});
