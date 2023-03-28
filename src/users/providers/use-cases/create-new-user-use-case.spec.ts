import { UsersRepository } from '../users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateNewUserUseCase } from './create-new-user-use-case';
import { UsersService } from '../users.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ban user use case', () => {
  let createNewUserUseCase: CreateNewUserUseCase;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [CreateNewUserUseCase],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        const initialize = (user) => Promise.resolve();

        if (token === UsersService) {
          return {
            getPasswordSalt: jest.fn().mockResolvedValue('mockSalt'),
            getPasswordHash: jest.fn().mockResolvedValue('mockHash'),
          };
        }
        if (token === UsersRepository) {
          return {
            createUserModel: jest.fn().mockResolvedValue({ initialize }),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();
    createNewUserUseCase =
      moduleFixture.get<CreateNewUserUseCase>(CreateNewUserUseCase);
  });
  it('should be defined', function () {
    expect(createNewUserUseCase).toBeDefined();
  });
});
