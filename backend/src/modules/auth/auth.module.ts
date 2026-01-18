import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [AuthService, SupabaseAuthGuard, ConfigService],
  exports: [AuthService, SupabaseAuthGuard],
})
export class AuthModule {}
