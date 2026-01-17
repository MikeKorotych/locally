import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkUserId } from 'src/decorators/clerk.decorator';
import { PROFILE_ENUMS } from 'src/enums/routes.enums';
import { ProfileService } from './profile.service';
import { User } from 'src/types/user/user.types';

@Controller(PROFILE_ENUMS.BASE)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(PROFILE_ENUMS.ME)
  public async profile(
    @ClerkUserId() clerkUserId: string,
  ): Promise<Partial<User>> {
    return await this.profileService.getOrCreate(clerkUserId);
  }
}
