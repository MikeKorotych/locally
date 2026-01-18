import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthUser } from '../auth/auth.decorator';
import { PROFILE_ENUMS } from './profile.enum';
import { type SupabaseJwtPayload } from '../auth/auth.types';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller(PROFILE_ENUMS.BASE)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(PROFILE_ENUMS.ME)
  public async profile(@AuthUser() user: SupabaseJwtPayload): Promise<any> {
    return await this.profileService.getOrCreate(user);
  }
}
