import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { User } from 'src/types/user/user.types';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  public async getOrCreate(clerkId: string): Promise<Partial<User>> {
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
        },
      });
      const {
        id,
        email: createdEmail,
        firstName: createdFirstName,
        lastName: createdLastName,
      } = newUser;
      return {
        id,
        email: createdEmail,
        firstName: createdFirstName,
        lastName: createdLastName,
      };
    }

    return existingUser;
  }
}
