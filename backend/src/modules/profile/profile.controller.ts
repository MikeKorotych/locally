import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkUserId } from 'src/decorators/clerk.decorator';
import { ClerkAuthGuard } from 'src/guards/clerk.guard';
import { ProfileService } from './profile.service';
import { PROFILE_ENUMS } from 'src/enums/routes.enums';

@UseGuards(ClerkAuthGuard)
@Controller(PROFILE_ENUMS.BASE)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(PROFILE_ENUMS.ME)
  public async profile(@ClerkUserId() clerkUserId: string): Promise<any> {
    return this.profileService.getOrCreate(clerkUserId);
  }
}
