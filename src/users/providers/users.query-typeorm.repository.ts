import { Injectable } from '@nestjs/common';
import { pagesCount } from '../../common/helpers/helpers';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { UserViewModel } from '../dto/view-models/user.view.model';
import { MeViewModel } from '../../common/dto/view-models/me.view.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsOrderValue,
  ILike,
  Repository,
} from 'typeorm';
import { User } from '../domain/user';
import {
  DeviceSessionSqlType,
  UserSqlDataType,
} from '../types/userSqlData.type';
import { UserEntity } from '../entities/user.entity';
import { EmailConfirmationEntity } from '../entities/email-confirmation.entity';
import { use } from 'passport';

@Injectable()
export class UsersQueryTypeormRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
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
    const conditionString = `users.email='${loginOrEmail}' OR users.login='${loginOrEmail}'`;
    return await this.findOne(conditionString);
  }

  async findUserByDeviceId(deviceId: string) {
    try {
      const result = await this.dataSource.query(
        `SELECT "userId" FROM device_sessions WHERE "deviceId"='${deviceId}';`,
      );
      return await this.findById(result[0].userId);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByEmailConfirmationCode(code: string) {
    try {
      const result = await this.dataSource.query(
        `SELECT "userId" FROM email_confirmation WHERE "confirmationCode"='${code}';`,
      );
      return await this.findById(result[0].userId);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByPasswordRecoveryCode(recoveryCode: string) {
    try {
      const result = await this.dataSource.query(
        `SELECT "userId" FROM password_recovery_information WHERE "recoveryCode"='${recoveryCode}'`,
      );
      return await this.findById(result[0].userId);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    console.log(`findById- typeOrm: ${id}`);
    // const conditionString = `users.id='${id}'`;
    // return await this.findOne(conditionString);
    const queryBuilder = this.usersRepository.createQueryBuilder('u');
    console.log(queryBuilder.getSql());

    const result = await queryBuilder
      .select(['u.login', 'ec.isConfirmed'])
      .leftJoinAndSelect('email_confirmation', 'ec', 'ec.userId=u.id', {
        isConfirmed: true,
      })
      .where('u.id=:id', { id })
      .getOne();
    console.log(queryBuilder.getSql());
    console.log(result);
    return null;
  }

  async getUserModel(id: string) {
    return this.findById(id);
  }

  async findOne(conditionString: string) {
    try {
      console.log('find one');
      const queryString = `
      SELECT users.*, 
      ec."confirmationCode",ec."dateSendingConfirmEmail", ec."expirationDate" AS "confirmationCodeExpirationDate", 
      bi."banDate", bi."banReason",
      pr."recoveryCode", pr."expirationDate" AS "recoveryPassCodeExpirationDate"
      FROM "users"
      LEFT JOIN "email_confirmation" ec ON users.id=ec."userId"
      LEFT JOIN "ban_info" bi ON users.id=bi."userId"
      LEFT JOIN "password_recovery_information" pr ON users.id=pr."userId"
      WHERE ${conditionString};
    `;
      const users = await this.dataSource.query(queryString);
      if (!users[0]) return null;
      return this.castToUserModel(users[0]);
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
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const where = {};
    if (searchLoginTerm) where['login'] = ILike(`%${searchLoginTerm}%`);
    if (searchEmailTerm) where['email'] = ILike(`%${searchEmailTerm}%`);
    if (banStatus === 'banned') where['isBanned'] = true;
    if (banStatus === 'notBanned') where['isBanned'] = false;
    //     let searchString = '';
    // if (searchLoginTerm) searchString += `login ILIKE '%${searchLoginTerm}%' `;
    // if (searchEmailTerm) {
    //   if (searchLoginTerm) searchString += 'OR ';
    //   searchString += `email ILIKE '%${searchEmailTerm}%' `;
    // }
    // let banSearchParam = '';
    // if (banStatus === 'banned') {
    //   banSearchParam = '"isBanned"=true';
    // }
    // if (banStatus === 'notBanned') {
    //   banSearchParam = '"isBanned"=false';
    // }
    // if (searchString) {
    //   searchString = `WHERE (${searchString})`;
    //   if (banSearchParam) searchString += `AND ${banSearchParam}`;
    // }
    // if (!searchString && banSearchParam) {
    //   searchString = `WHERE ${banSearchParam}`;
    // }
    try {
      const findOptions: FindManyOptions<UserEntity> = {
        relations: {
          emailConfirmation: true,
          deviceSessions: true,
          banInfo: true,
          passwordRecoveryInformation: true,
        },
        order: {},
        where,
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

  async getEmailConfirmationData(userId: string) {
    const user = await this.findById(userId);
    console.log();
    console.log('user.emailConfirmation.confirmationCode');
    console.log(user.emailConfirmation.confirmationCode);
    if (!user) return null;
    return {
      email: user.accountData.email,
      confirmationCode: user.emailConfirmation.confirmationCode,
      expirationDate: user.emailConfirmation.expirationDate,
    };
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
    user.id = userEntity.id;
    user.accountData = {
      login: userEntity.login,
      email: userEntity.email,
      passwordHash: userEntity.passwordHash,
      passwordSalt: userEntity.passwordSalt,
      createdAt: +userEntity.createdAt,
    };
    user.banInfo = {
      isBanned: userEntity.banInfo?.isBanned,
      banDate: +userEntity.banInfo?.banDate || null,
      banReason: userEntity.banInfo?.banReason,
      sa: 'superAdmin',
    };

    user.emailConfirmation = {
      isConfirmed: userEntity.emailConfirmation?.isConfirmed,
      confirmationCode: userEntity.emailConfirmation?.confirmationCode,
      expirationDate: +userEntity.emailConfirmation?.expirationDate || null,
      dateSendingConfirmEmail:
        +userEntity.emailConfirmation?.dateSendingConfirmEmail || null,
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
}
