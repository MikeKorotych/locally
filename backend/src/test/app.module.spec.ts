import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AuthService } from '../modules/auth/auth.service';
import { SupabaseAuthGuard } from '../modules/auth/auth.guard';

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
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
