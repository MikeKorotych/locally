import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Greetings from Locally Backend 🫆';
  }
}
