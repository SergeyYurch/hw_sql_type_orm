import { Injectable } from '@nestjs/common';
import { pagesCount } from '../../common/helpers/helpers';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { UserViewModel } from '../dto/view-models/user.view.model';
import { MeViewModel } from '../../common/dto/view-models/me.view.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { User } from '../domain/user';
import { UserEntity } from '../entities/user.entity';
import { DeviceSessionsEntity } from '../entities/device-sessions.entity';
import { PasswordRecoveryInformationEntity } from '../entities/password-recovery-information.entity';

@Injectable()
export class UsersQueryTypeormRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(DeviceSessionsEntity)
    private readonly deviceSessionRepository: Repository<DeviceSessionsEntity>,
    @InjectRepository(PasswordRecoveryInformationEntity)
    private readonly passwordRecoveryInformationRepository: Repository<PasswordRecoveryInformationEntity>,
  ) {}
  async doesUserIdExist(
    userId: string,
    options?: { bannedInclude: boolean },
  ): Promise<boolean> {
    try {
      console.log('[doesUserIdExist]-start');
      let queryString = `SELECT EXISTS (SELECT * FROM users WHERE id=${userId} AND "isBanned"=false)`;
      if (options?.bannedInclude)
        queryString = `SELECT EXISTS (SELECT * FROM users WHERE id=${userId})`;
      console.log(queryString);
      return await this.dataSource.query(queryString);
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async isUserBanned(userId: string): Promise<boolean> {
    try {
      const queryString = `SELECT "isBanned" FROM users WHERE id=${userId}`;
      const result = await this.dataSource.query(queryString);
      return !!result[0]?.isBanned;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return await this.findOne([
      { login: loginOrEmail },
      { email: loginOrEmail },
    ]);
  }

  // async findUserByDeviceId(deviceId: string) {
  //   try {
  //     const queryBuilder = await this.deviceSessionRepository
  //       .createQueryBuilder('ds')
  //       .select('userId')
  //       .where(`ds.deviceId = ${deviceId}`)
  //       .getOne();
  //     console.log(queryBuilder);
  //     //return await this.findById(result[0].userId);
  //   } catch (e) {
  //     console.log(e);
  //     return null;
  //   }
  // }

  async findUserByEmailConfirmationCode(confirmationCode: string) {
    try {
      const userEntity = await this.usersRepository.findOne({
        where: { confirmationCode },
        relations: {
          deviceSessions: true,
          passwordRecoveryInformation: true,
        },
      });
      debugger;
      if (userEntity) return this.castToUserModel(userEntity);
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByPasswordRecoveryCode(recoveryCode: string) {
    try {
      const priEntity = await this.passwordRecoveryInformationRepository
        .createQueryBuilder('pri')
        .where(`pri.recoveryCode='${recoveryCode}'`)
        .getOne();
      const user = await this.findById(String(priEntity.userId));
      debugger;
      return user;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    console.log(`findById- typeOrm: ${id}`);
    const userEntity: UserEntity = await this.usersRepository.findOne({
      relations: {
        deviceSessions: true,
        passwordRecoveryInformation: true,
      },
      where: { id: +id },
    });
    debugger;
    return userEntity ? this.castToUserModel(userEntity) : null;
  }

  async getUserModel(id: string) {
    return this.findById(id);
  }

  async findOne(
    condition: FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[],
  ): Promise<User | null> {
    try {
      console.log('find one');
      const userEntity: UserEntity = await this.usersRepository.findOne({
        relations: {
          deviceSessions: true,
          passwordRecoveryInformation: true,
        },
        where: condition,
      });
      debugger;
      return userEntity ? this.castToUserModel(userEntity) : null;
    } catch (e) {
      console.log('Did not found users');
      console.log(e);
      return null;
    }
  }

  async find(
    paginatorParams: PaginatorInputType,
    searchLoginTerm?: string,
    searchEmailTerm?: string,
    banStatus?: string,
  ) {
    try {
      const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
      const conditions = [];
      if (searchLoginTerm) {
        const loginCondition = {};
        loginCondition['login'] = ILike(`%${searchLoginTerm}%`);
        if (banStatus !== 'all') {
          loginCondition['isBanned'] = banStatus === 'banned';
        }
        conditions.push(loginCondition);
      }
      if (searchEmailTerm) {
        const emailCondition = {};
        emailCondition['email'] = ILike(`%${searchEmailTerm}%`);
        if (banStatus !== 'all') {
          emailCondition['isBanned'] = banStatus === 'banned';
        }
        conditions.push(emailCondition);
      }
      console.log(conditions);
      const findOptions: FindManyOptions<UserEntity> = {
        relations: {
          deviceSessions: true,
          passwordRecoveryInformation: true,
        },
        order: {},
        where: conditions,
        skip: pageSize * (pageNumber - 1),
        take: pageSize,
      };
      findOptions.order[sortBy] = sortDirection;
      const [users, totalCount] = await this.usersRepository.findAndCount(
        findOptions,
      );
      const userModels: User[] = [];
      for (const user of users) {
        userModels.push(await this.castToUserModel(user));
      }
      return { totalCount, userModels };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getUserById(id: string, withBanStatus?: boolean) {
    const user = await this.findById(id);
    if (!user) return null;
    return withBanStatus
      ? this.getUserSaViewModel(user)
      : this.getUserViewModel(user);
  }

  async findUsers(
    paginatorParams: PaginatorInputType,
    searchLoginTerm?: string,
    searchEmailTerm?: string,
    banStatus?: string,
    withBanStatus = false,
  ) {
    const findResult: { totalCount: number; userModels: User[] } | null =
      await this.find(
        paginatorParams,
        searchLoginTerm,
        searchEmailTerm,
        banStatus,
      );
    let totalCount = 0;
    let userModels = [];
    if (findResult) {
      totalCount = findResult.totalCount;
      userModels = findResult.userModels;
    }
    const { pageSize, pageNumber } = paginatorParams;
    const items: UserViewModel[] = userModels.map((u) =>
      withBanStatus ? this.getUserSaViewModel(u) : this.getUserViewModel(u),
    );
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  private getUserViewModel(user: User): UserViewModel {
    return {
      id: user.id,
      email: user.accountData.email,
      login: user.accountData.login,
      createdAt: new Date(user.accountData.createdAt).toISOString(),
    };
  }

  private getUserSaViewModel(user: User) {
    return {
      id: user.id,
      email: user.accountData.email,
      login: user.accountData.login,
      createdAt: new Date(user.accountData.createdAt).toISOString(),
      banInfo: {
        isBanned: user.banInfo.isBanned || false,
        banDate: user.banInfo.banDate
          ? new Date(user.banInfo.banDate).toISOString()
          : null,
        banReason: user.banInfo.banReason || null,
      },
    };
  }

  private async castToUserModel(userEntity: UserEntity): Promise<User> {
    const user = new User();
    user.id = String(userEntity.id);
    user.accountData = {
      login: userEntity.login,
      email: userEntity.email,
      passwordHash: userEntity.passwordHash,
      passwordSalt: userEntity.passwordSalt,
      createdAt: +userEntity.createdAt,
    };
    user.banInfo = {
      isBanned: userEntity.isBanned,
      banDate: +userEntity.banDate || null,
      banReason: userEntity.banReason,
      sa: 'superAdmin',
    };
    debugger;
    user.emailConfirmation = {
      isConfirmed: userEntity.isConfirmed,
      confirmationCode: userEntity.confirmationCode,
      expirationDate: +userEntity.expirationDate || null,
      dateSendingConfirmEmail: +userEntity.dateSendingConfirmEmail || null,
    };
    user.passwordRecoveryInformation = {
      recoveryCode: userEntity.passwordRecoveryInformation?.recoveryCode,
      expirationDate:
        +userEntity.passwordRecoveryInformation?.expirationDate || null,
    };
    user.deviceSessions = userEntity.deviceSessions.map((d) => ({
      deviceId: d.deviceId,
      ip: d.ip,
      title: d.title,
      lastActiveDate: +d.lastActiveDate,
      expiresDate: +d.expiresDate,
    }));
    console.log(user);
    return user;
  }

  async getMeInfo(userId: string) {
    const user = await this.findById(userId);
    if (!user) return null;
    return this.getMeViewModel(user);
  }

  getMeViewModel(user: User): MeViewModel {
    return {
      login: user.accountData.login,
      email: user.accountData.email,
      userId: user.id,
    };
  }

  async test() {
    const user = await this.usersRepository.findOne({
      where: { id: 18 },
      relations: {
        deviceSessions: true,
        passwordRecoveryInformation: true,
      },
    });
    console.log(user);
  }
}
