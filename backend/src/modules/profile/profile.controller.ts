import { Controller, Get, UseGuards } from '@nestjs/common';
import { PROFILE_ENUMS } from 'src/enums/routes.enums';
import { ProfileService } from './profile.service';
import { AuthUser } from '../auth/auth.decorator';

@UseGuards()
@Controller(PROFILE_ENUMS.BASE)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(PROFILE_ENUMS.ME)
  public async profile(@AuthUser() userSub: string): Promise<any> {
    return await this.profileService.getOrCreate(userSub);
  }
}
