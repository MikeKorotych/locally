import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { AuthService } from '../auth.service';
import { SupabaseAuthGuard } from '../auth.guard';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue({ verifyToken: jest.fn() })
      .compile();
  });

  it('compiles', () => {
    expect(module).toBeDefined();
  });

  it('provides SupabaseAuthGuard', () => {
    const guard = module.get(SupabaseAuthGuard);
    expect(guard).toBeDefined();
  });

  afterAll(async () => {
    await module.close();
  });
});
