import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Role, User } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  public async getOrCreate(clerkId: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!existingUser) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const { firstName, lastName } = clerkUser;
      const newUser = await this.prisma.user.create({
        data: {
          clerkId,
          email,
          firstName,
          lastName,
          role: Role.CUSTOMER,
        },
      });
      return newUser;
    }

    return existingUser;
  }
}
