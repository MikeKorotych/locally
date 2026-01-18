import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './auth.guard';

@Global()
@Module({
  providers: [AuthService, SupabaseAuthGuard],
  exports: [AuthService, SupabaseAuthGuard],
})
export class AuthModule {}
