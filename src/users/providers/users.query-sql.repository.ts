import { Injectable } from '@nestjs/common';
import { pagesCount } from '../../common/helpers/helpers';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { UserViewModel } from '../dto/view-models/user.view.model';
import { MeViewModel } from '../../common/dto/view-models/me.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEntity } from '../domain/user.entity';
import {
  DeviceSessionSqlType,
  UserSqlDataType,
} from '../types/userSqlData.type';

@Injectable()
export class UsersQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
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

  async findById(id: string) {
    console.log(`findById: ${id}`);
    const conditionString = `users.id='${id}'`;
    return await this.findOne(conditionString);
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
      return this.castToUserEntity(users[0]);
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
    let searchString = '';
    if (searchLoginTerm) searchString += `login ILIKE '%${searchLoginTerm}%' `;
    if (searchEmailTerm) {
      if (searchLoginTerm) searchString += 'OR ';
      searchString += `email ILIKE '%${searchEmailTerm}%' `;
    }
    let banSearchParam = '';
    if (banStatus === 'banned') {
      banSearchParam = '"isBanned"=true';
    }
    if (banStatus === 'notBanned') {
      banSearchParam = '"isBanned"=false';
    }
    if (searchString) {
      searchString = `WHERE (${searchString})`;
      if (banSearchParam) searchString += `AND ${banSearchParam}`;
    }
    if (!searchString && banSearchParam) {
      searchString = `WHERE ${banSearchParam}`;
    }
    try {
      console.log(searchString);
      const totalCount = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM users
    ${searchString}
    `);
      const queryString = `
      SELECT users.*, 
      ec."confirmationCode",ec."dateSendingConfirmEmail", ec."expirationDate" as "confirmationCodeExpirationDate", 
      bi."banDate", bi."banReason",
      pr."recoveryCode", pr."expirationDate" as "recoveryPassCodeExpirationDate"
      FROM "users" 
      LEFT JOIN "email_confirmation" ec ON users.id=ec."userId"
      LEFT JOIN "ban_info" bi ON users.id=bi."userId"
      LEFT JOIN "password_recovery_information" pr ON users.id=pr."userId"
      ${searchString}
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${pageSize}
      OFFSET ${pageSize * (pageNumber - 1)};
    `;
      const users: UserSqlDataType[] = await this.dataSource.query(queryString);
      const userEntities: UserEntity[] = [];
      for (const user of users) {
        userEntities.push(await this.castToUserEntity(user));
      }
      return { totalCount: +totalCount[0].count, userEntities };
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
    const { totalCount, userEntities } = await this.find(
      paginatorParams,
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
    );
    const { pageSize, pageNumber } = paginatorParams;
    const items: UserViewModel[] = userEntities.map((u) =>
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

  private getUserViewModel(user: UserEntity): UserViewModel {
    return {
      id: user.id,
      email: user.accountData.email,
      login: user.accountData.login,
      createdAt: new Date(user.accountData.createdAt).toISOString(),
    };
  }

  private getUserSaViewModel(user: UserEntity) {
    return {
      id: user.id,
      email: user.accountData.email,
      login: user.accountData.login,
      createdAt: new Date(user.accountData.createdAt).toISOString(),
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate
          ? new Date(user.banInfo.banDate).toISOString()
          : null,
        banReason: user.banInfo.banReason,
      },
    };
  }

  private async castToUserEntity(
    userData: UserSqlDataType,
  ): Promise<UserEntity> {
    const userEntity = new UserEntity();
    userEntity.id = userData.id;
    userEntity.accountData = {
      login: userData.login,
      email: userData.email,
      passwordHash: userData.passwordHash,
      passwordSalt: userData.passwordSalt,
      createdAt: +userData.createdAt,
    };
    userEntity.banInfo = {
      isBanned: userData.isBanned,
      banDate: +userData.banDate || null,
      banReason: userData.banReason,
      sa: 'superAdmin',
    };

    userEntity.emailConfirmation = {
      isConfirmed: userData.isConfirmed,
      confirmationCode: userData.confirmationCode,
      expirationDate: +userData.confirmationCodeExpirationDate || null,
      dateSendingConfirmEmail: +userData.dateSendingConfirmEmail || null,
    };
    userEntity.passwordRecoveryInformation = {
      recoveryCode: userData.recoveryCode,
      expirationDate: +userData.recoveryPassCodeExpirationDate || null,
    };
    const sessions: DeviceSessionSqlType[] = await this.dataSource.query(`
      SELECT * 
      FROM "device_sessions"
      WHERE "userId"='${userData.id}';
    `);
    userEntity.deviceSessions = sessions.map((d) => ({
      deviceId: d.deviceId,
      ip: d.ip,
      title: d.title,
      lastActiveDate: +d.lastActiveDate,
      expiresDate: +d.expiresDate,
    }));
    return userEntity;
  }

  async getMeInfo(userId: string) {
    const user = await this.findById(userId);
    if (!user) return null;
    return this.getMeViewModel(user);
  }

  getMeViewModel(user: UserEntity): MeViewModel {
    return {
      login: user.accountData.login,
      email: user.accountData.email,
      userId: user.id,
    };
  }
}
