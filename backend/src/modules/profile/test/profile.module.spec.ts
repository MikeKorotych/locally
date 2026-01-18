import { Test, TestingModule } from '@nestjs/testing';
import { ProfileModule } from '../profile.module';
import { SupabaseAuthGuard } from '../../auth/auth.guard';
import { AuthModule } from '../../auth/auth.module';
import { AuthService } from '../../auth/auth.service';

describe('ProfileModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ProfileModule, AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue({ verifyToken: jest.fn() })
      .compile();
  });

  it('compiles', () => {
    expect(module).toBeDefined();
  });

  it('registers SupabaseAuthGuard', () => {
    const guard = module.get(SupabaseAuthGuard);
    expect(guard).toBeDefined();
  });

  afterAll(async () => {
    await module.close();
  });
});
