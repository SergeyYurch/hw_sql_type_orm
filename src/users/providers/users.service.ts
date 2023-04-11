import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  getPasswordSalt() {
    return bcrypt.genSalt(10);
  }
  getPasswordHash(password: string, passwordSalt: string) {
    return bcrypt.hash(password, passwordSalt);
  }
}
