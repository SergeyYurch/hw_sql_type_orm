import { INestApplication } from '@nestjs/common';
import { TestingTestHelpers } from './testing-test.helpers';
import { UsersTestHelpers } from './users.test.helpers';
import { AuthTestHelpers } from './auth.test.helpers';
import { AccountsTestHelpers } from './accounts.test.helpers';
import { GameTestHelpers } from './game.test.helpers';
import { Question } from '../../src/features/quiz/domain/question';

export class PrepareOptions {
  countOfUsers?: number;
  startNumberUser?: number;
  countOfQuestions?: number;
}

export class PrepareTestHelpers {
  testingTestHelpers: TestingTestHelpers;
  usersTestService: UsersTestHelpers;
  authTestHelpers: AuthTestHelpers;
  accountsTestHelpers: AccountsTestHelpers;
  gameTestService: GameTestHelpers;
  questions: Question[];
  accessTokens: string[];
  refreshTokens: string[];
  gameIds = [];
  constructor(private app: INestApplication) {
    this.testingTestHelpers = new TestingTestHelpers(this.app);
    this.usersTestService = new UsersTestHelpers(this.app);
    this.authTestHelpers = new AuthTestHelpers(this.app);
    this.gameTestService = new GameTestHelpers(this.app);
    this.accountsTestHelpers = new AccountsTestHelpers(app);
  }

  async prepare(options?: PrepareOptions) {
    const countOfUsers = options?.countOfUsers ?? 0;
    const startNumberUser = options?.startNumberUser ?? 1;
    const countOfQuestions = options?.countOfQuestions ?? 0;
    await this.testingTestHelpers.clearDb();
    if (countOfUsers > 0) {
      this.accessTokens = (
        await this.accountsTestHelpers.createAndLoginUsers(
          countOfUsers,
          startNumberUser,
        )
      ).accessTokens;
    }

    if (countOfQuestions > 0) {
      this.questions = await this.gameTestService.createAndPublishQuestions(
        countOfQuestions,
      );
    }
    return { accessTokens: this.accessTokens, questions: this.questions };
  }
}
