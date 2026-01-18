import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  SupabaseJwtPayload,
  AuthMethod,
  AuthProvider,
} from '../auth/auth.types';
import { User } from 'src/types/user/user.types';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  public async getOrCreate(user: SupabaseJwtPayload): Promise<User> {
    const existingAuthIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'SUPABASE',
          providerUserId: user.sub,
        },
      },
      include: {
        user: true,
      },
    });
    if (existingAuthIdentity) {
      return existingAuthIdentity.user;
    } else {
      const newUser = await this.prisma.$transaction(async (prisma) => {
        const createdUser = await prisma.user.create({
          data: {
            email: user.email || null,
            firstName: user.user_metadata.first_name || null,
            lastName: user.user_metadata.last_name || null,
          },
        });
        await prisma.authIdentity.create({
          data: {
            provider: 'SUPABASE',
            providerUserId: user.sub,
            userId: createdUser.id,
            method: 'EMAIL',
          },
        });
        return createdUser;
      });
      return newUser;
    }
  }
}
