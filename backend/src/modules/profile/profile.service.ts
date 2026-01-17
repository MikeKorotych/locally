import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  public async getOrCreate(userSub: string): Promise<any> {
    //  Try to find the user by their sub (unique identifier)
  }
}
