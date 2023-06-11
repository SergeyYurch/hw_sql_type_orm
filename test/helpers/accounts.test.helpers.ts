import { UsersTestHelpers } from './users.test.helpers';
import { UserInputModel } from '../../src/features/users/dto/input-models/user-input-model';
import { LoginInputModel } from '../../src/features/auth/dto/login.input.model';
import { AuthTestHelpers } from './auth.test.helpers';
import { INestApplication } from '@nestjs/common';
import { UserViewModel } from '../../src/features/users/dto/view-models/user.view.model';

export class AccountsTestHelpers {
  usersTestService: UsersTestHelpers;
  authTestHelpers: AuthTestHelpers;
  constructor(private app: INestApplication) {
    this.usersTestService = new UsersTestHelpers(app);
    this.authTestHelpers = new AuthTestHelpers(app);
  }
  getUserInputModel(n: number) {
    return {
      login: `user${n}`,
      password: `password${n}`,
      email: `email${n}@gmail.com`,
    };
  }
  async createSetOfUsers(count: number, startNumber = 1) {
    const users: UserViewModel[] = [];
    for (let i = 0; i < count; i++) {
      console.log('t12');
      console.log(`i:${i}`);
      console.log(`count:${count}`);
      console.log(`startNumber:${startNumber}`);
      const user: UserInputModel = this.getUserInputModel(startNumber);
      console.log(`user:${user.login}`);
      const createdUser = await this.usersTestService.createUser(user, 201);
      users.push(createdUser);
      startNumber++;
    }
    return users;
  }
  async createAndLoginUsers(count: number, startNumber = 1) {
    const accessTokens = [];
    const refreshTokens = [];
    const users = await this.createSetOfUsers(count, startNumber);
    for (let i = 0; i < count; i++) {
      const loginData: LoginInputModel = {
        loginOrEmail: `user${startNumber}`,
        password: `password${startNumber}`,
      };
      const { refreshToken, accessToken } =
        await this.authTestHelpers.loginUser(loginData);
      accessTokens.push(accessToken);
      refreshTokens.push(refreshToken);
      startNumber++;
    }
    return { accessTokens, refreshTokens, users };
  }
}
