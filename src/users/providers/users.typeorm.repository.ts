import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user';
import { UserEntity } from '../entities/user.entity';
import { DeviceSessionsEntity } from '../entities/device-sessions.entity';
import { PasswordRecoveryInformationEntity } from '../entities/password-recovery-information.entity';
import { UsersQueryTypeormRepository } from './users.query-typeorm.repository';

@Injectable()
export class UsersTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected userQueryRepository: UsersQueryTypeormRepository,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(DeviceSessionsEntity)
    private readonly deviceSessionRepository: Repository<DeviceSessionsEntity>,
    @InjectRepository(PasswordRecoveryInformationEntity)
    private readonly passwordRecoveryInformationRepository: Repository<PasswordRecoveryInformationEntity>,
  ) {}

  async getUserModel(userId: string) {
    return this.userQueryRepository.findById(userId);
  }
  //
  // async getUser() {
  //   return this.dataSource.query('SELECT * FROM public.users');
  // }

  async createUserModel() {
    return new User();
  }

  async deleteUser(userId: string) {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .delete()
      .from(UserEntity)
      .where('id = :id', { id: userId })
      .execute();
    return result.affected === 1;
  }

  async save(user: User) {
    console.log('start User save');
    let userEntity: UserEntity;
    if (!user.id) {
      userEntity = new UserEntity();
    } else {
      userEntity = await this.usersRepository.findOne({
        where: { id: +user.id },
        relations: {
          deviceSessions: true,
          passwordRecoveryInformation: true,
        },
      });
    }
    userEntity.login = user.accountData.login;
    userEntity.email = user.accountData.email;
    userEntity.passwordHash = user.accountData.passwordHash;
    userEntity.passwordSalt = user.accountData.passwordSalt;
    userEntity.createdAt = user.accountData.createdAt;
    userEntity.isBanned = user.banInfo?.isBanned;
    userEntity.banDate = user.banInfo?.banDate;
    userEntity.banReason = user.banInfo?.banReason;
    userEntity.isConfirmed = user.emailConfirmation?.isConfirmed;
    userEntity.confirmationCode = user.emailConfirmation?.confirmationCode;
    userEntity.expirationDate = user.emailConfirmation?.expirationDate;
    userEntity.dateSendingConfirmEmail =
      user.emailConfirmation?.dateSendingConfirmEmail;
    //try to map User to UserEntity and save model
    await this.usersRepository.save(userEntity);
    if (user.passwordRecoveryInformation) {
      const passwordRecoveryInformation =
        new PasswordRecoveryInformationEntity();
      passwordRecoveryInformation.recoveryCode =
        user.passwordRecoveryInformation.recoveryCode;
      passwordRecoveryInformation.expirationDate =
        user.passwordRecoveryInformation.expirationDate;
      passwordRecoveryInformation.userId = userEntity.id;
      console.log('save passwordRecoveryInformation');
      console.log(passwordRecoveryInformation);
      await this.passwordRecoveryInformationRepository.save(
        passwordRecoveryInformation,
      );
      userEntity.passwordRecoveryInformation = passwordRecoveryInformation;
    }
    const activeDeviceIds: string[] = [];
    if (user.deviceSessions?.length > 0) {
      for (const ds of user.deviceSessions) {
        activeDeviceIds.push(ds.deviceId);
        const deviceSession = new DeviceSessionsEntity();
        deviceSession.user = userEntity;
        deviceSession.deviceId = ds.deviceId;
        deviceSession.ip = ds.ip;
        deviceSession.title = ds.title;
        deviceSession.lastActiveDate = ds.lastActiveDate;
        deviceSession.expiresDate = ds.expiresDate;
        await this.deviceSessionRepository.save(deviceSession);
        userEntity.deviceSessions.push(deviceSession);
      }
    }
    if (userEntity.deviceSessions?.length > 0) {
      for (const ds of userEntity.deviceSessions) {
        if (!activeDeviceIds.includes(ds.deviceId)) {
          await this.deviceSessionRepository.delete({
            deviceId: ds.deviceId,
          });
        }
      }
    }
    return userEntity.id;
    // ////
    //
    // const userFromDb = await this.userQueryRepository.findById(user.id);
    // //if user banned
    // if (userFromDb.banInfo.isBanned !== user.banInfo.isBanned) {
    //   await this.banUser(user);
    // }
    // if (
    //   !userFromDb.emailConfirmation.isConfirmed &&
    //   user.emailConfirmation.isConfirmed
    // ) {
    //   await this.confirmEmail(user);
    // }
    //
    // if (
    //   !userFromDb.passwordRecoveryInformation.recoveryCode &&
    //   user.passwordRecoveryInformation.recoveryCode
    // ) {
    //   await this.insertPasswordRecoveryInfoRow(user);
    // }
    //
    // if (
    //   (!userFromDb.passwordRecoveryInformation.recoveryCode &&
    //     user.passwordRecoveryInformation.recoveryCode) ||
    //   +userFromDb.passwordRecoveryInformation.expirationDate < Date.now()
    // ) {
    //   await this.deletePasswordRecoveryInfoRow(user);
    // }
    //
    // //deviceSession change
    // //delete all sessions in DB for current user
    // if (userFromDb.deviceSessions.length > 0) {
    //   let conditionString = '';
    //   for (let i = 0; i < userFromDb.deviceSessions.length; i++) {
    //     if (i === 0) {
    //       conditionString = `WHERE "deviceId"='${userFromDb.deviceSessions[i].deviceId}'`;
    //       continue;
    //     }
    //     conditionString += `OR "deviceId"='${userFromDb.deviceSessions[i].deviceId}'`;
    //   }
    //
    //   const queryString = `DELETE FROM device_sessions ${conditionString}`;
    //   await this.dataSource.query(queryString);
    // }
    // //add new device sessions in DB if they are exist
    // if (user.deviceSessions.length > 0) {
    //   await this.insertDeviceSessionRows(user);
    // }
    // return user.id;
  }
  // private async insertNewUser(user: User) {
  //   try {
  //     const { accountData, emailConfirmation } = user;
  //     const userEntity = new UserEntity();
  //     userEntity.login = accountData.login;
  //     userEntity.email = accountData.email;
  //     userEntity.passwordSalt = accountData.passwordSalt;
  //     userEntity.passwordHash = accountData.passwordHash;
  //     userEntity.createdAt = accountData.createdAt;
  //     await this.usersRepository.save(userEntity);
  //     return userEntity.id;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // private async insertEmailConfirmationRow(user: User) {
  //   try {
  //     const { confirmationCode, expirationDate, dateSendingConfirmEmail } =
  //       user.emailConfirmation;
  //     const queryString = `
  //       INSERT INTO email_confirmation
  //           ("confirmationCode", "expirationDate", "dateSendingConfirmEmail", "userId")
  //       VALUES ('${confirmationCode}', '${expirationDate}', '${dateSendingConfirmEmail}', '${user.id}')
  //       `;
  //     await this.dataSource.query(queryString);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // private async insertPasswordRecoveryInfoRow(user: User) {
  //   try {
  //     const { recoveryCode, expirationDate } = user.passwordRecoveryInformation;
  //     const queryString = `
  //       INSERT INTO password_recovery_information
  //           ("recoveryCode", "expirationDate", "userId")
  //       VALUES ('${recoveryCode}', '${expirationDate}', '${user.id}')
  //       `;
  //     await this.dataSource.query(queryString);
  //   } catch (e) {
  //     console.log(e);
  //     return null;
  //   }
  // }
  //
  // private async deletePasswordRecoveryInfoRow(user: User) {
  //   try {
  //     const queryString = `
  //       DELETE FROM password_recovery_information WHERE "userId"=${user.id}
  //       `;
  //     await this.dataSource.query(queryString);
  //     return true;
  //   } catch (e) {
  //     console.log(e);
  //     return false;
  //   }
  // }

  // private async insertDeviceSessionRows(user: User) {
  //   try {
  //     const sessions = user.deviceSessions;
  //     const valuesArray = sessions.map(
  //       (s) =>
  //         `('${s.deviceId}', '${s.ip}', '${s.title}', '${user.id}', '${s.lastActiveDate}', '${s.expiresDate}')`,
  //     );
  //     const values = valuesArray.join(',');
  //     await this.dataSource.query(
  //       `INSERT INTO device_sessions ("deviceId", ip, title, "userId", "lastActiveDate", "expiresDate") VALUES ${values}`,
  //     );
  //   } catch (e) {
  //     console.log(e);
  //     return null;
  //   }
  // }

  // private getChangeQueryString(changes: { field: string; value: any }[]) {
  //   const changesArray = changes.map((c) => {
  //     let value: string;
  //     if (typeof c.value === 'string') {
  //       value = `'${c.value}'`;
  //     } else {
  //       value = c.value;
  //     }
  //     return `"${c.field}"=${value}`;
  //   });
  //   return changesArray.join(',');
  // }
  //
  // private async banUser(user: User) {
  //   try {
  //     if (user.banInfo.isBanned) {
  //       const { banReason, banDate } = user.banInfo;
  //       const queryString = `
  //       INSERT INTO ban_info
  //           ("banDate", "banReason", "userId")
  //       VALUES ('${banDate}', '${banReason}',  '${user.id}');
  //       UPDATE users SET "isBanned"=true WHERE id=${user.id};
  //       `;
  //       await this.dataSource.query(queryString);
  //       return true;
  //     }
  //     const queryString = `
  //       DELETE FROM ban_info WHERE "userId"=${user.id};
  //       UPDATE users SET "isBanned"=false WHERE id=${user.id};
  //       `;
  //     await this.dataSource.query(queryString);
  //     return true;
  //   } catch (e) {
  //     console.log(e);
  //     return false;
  //   }
  // }
  //
  // private async confirmEmail(user: User) {
  //   try {
  //     const queryString = `
  //       UPDATE users SET "isConfirmed"=true WHERE id=${user.id};
  //       DELETE FROM email_confirmation WHERE "userId"=${user.id}
  //   `;
  //     await this.dataSource.query(queryString);
  //     return true;
  //   } catch (e) {
  //     console.log(e);
  //     return false;
  //   }
  // }
}
