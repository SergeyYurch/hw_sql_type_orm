import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async getPasswordSalt() {
    return await bcrypt.genSalt(10);
  }
  async getPasswordHash(password: string, passwordSalt: string) {
    return await bcrypt.hash(password, passwordSalt);
  }
}
