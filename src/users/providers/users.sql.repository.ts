import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from '../domain/user.entity';
import { UsersQuerySqlRepository } from './users.query-sql.repository';

@Injectable()
export class UsersSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected userQueryRepository: UsersQuerySqlRepository,
  ) {}

  async getUserModel(userId: string) {
    return this.userQueryRepository.findById(userId);
  }
  //
  // async getUser() {
  //   return this.dataSource.query('SELECT * FROM public.users');
  // }

  async createUserModel() {
    return new UserEntity();
  }

  async deleteUser(userId: string) {
    await this.dataSource.query(`
        DELETE FROM ban_info WHERE "userId"=${userId};
        DELETE FROM device_sessions WHERE "userId"=${userId};
        DELETE FROM email_confirmation  WHERE "userId"=${userId};
        DELETE FROM password_recovery_information  WHERE "userId"=${userId};
        DELETE FROM users  WHERE "id"=${userId};
`);
    return true;
  }

  async save(user: UserEntity) {
    if (!user.id) {
      return await this.insertNewUser(user);
    }

    const userFromDb = await this.userQueryRepository.findById(user.id);
    //if user banned
    if (userFromDb.banInfo.isBanned !== user.banInfo.isBanned) {
      await this.banUser(user);
    }
    if (
      !userFromDb.emailConfirmation.isConfirmed &&
      user.emailConfirmation.isConfirmed
    ) {
      await this.confirmEmail(user);
    }

    if (
      !userFromDb.passwordRecoveryInformation.recoveryCode &&
      user.passwordRecoveryInformation.recoveryCode
    ) {
      await this.insertPasswordRecoveryInfoRow(user);
    }

    if (
      (!userFromDb.passwordRecoveryInformation.recoveryCode &&
        user.passwordRecoveryInformation.recoveryCode) ||
      +userFromDb.passwordRecoveryInformation.expirationDate < Date.now()
    ) {
      await this.deletePasswordRecoveryInfoRow(user);
    }
    //
    //
    // //changeDetection
    // const usersChanges = [];
    // const emailConfirmationChanges = [];
    // const passwordRecoveryInformationChanges = [];
    // const banInfoChanges = [];
    //
    // //detection of changes in the accountData
    // for (const key in user.accountData) {
    //   if (
    //     !(user.accountData[key] instanceof Date) &&
    //     user.accountData[key] !== userFromDb.accountData[key]
    //   ) {
    //     usersChanges.push({ field: key, value: user.accountData[key] });
    //   }
    // }
    //
    // //detection of changes in the emailConfirmation
    // for (const key in user.emailConfirmation) {
    //   if (user.emailConfirmation[key] !== userFromDb.emailConfirmation[key]) {
    //     if (key === 'isConfirmed') {
    //       usersChanges.push({ field: key, value: user.emailConfirmation[key] });
    //       continue;
    //     }
    //     emailConfirmationChanges.push({
    //       field: key,
    //       value: user.emailConfirmation[key],
    //     });
    //   }
    // }
    // //detection of changes in the passwordRecoveryInformation
    // for (const key in user.passwordRecoveryInformation) {
    //   if (
    //     user.passwordRecoveryInformation[key] !==
    //     userFromDb.passwordRecoveryInformation[key]
    //   ) {
    //     passwordRecoveryInformationChanges.push({
    //       field: key,
    //       value: user.passwordRecoveryInformation[key],
    //     });
    //   }
    // }
    //
    // //detection of  changes in the banInfo
    // for (const key in user.banInfo) {
    //   if (user.banInfo[key] !== userFromDb.banInfo[key]) {
    //     if (key === 'isBanned') {
    //       usersChanges.push({ field: key, value: user.banInfo[key] });
    //       continue;
    //     }
    //     banInfoChanges.push({
    //       field: key,
    //       value: user.banInfo[key],
    //     });
    //   }
    // }
    //
    // if (usersChanges.length > 0) {
    //   //update users
    //   try {
    //     const changeString = this.getChangeQueryString(usersChanges);
    //     const queryString = `UPDATE users SET ${changeString} WHERE users.id='${user.id}'`;
    //     await this.dataSource.query(queryString);
    //   } catch (e) {
    //     console.log(e);
    //     return null;
    //   }
    // }
    //
    // if (emailConfirmationChanges.length > 0) {
    //   const isExistRows = await this.dataSource.query(
    //     `SELECT * FROM email_confirmation  WHERE "userId"='${user.id}'`,
    //   );
    //   //add new row
    //   if (isExistRows.length < 1) {
    //     return await this.insertEmailConfirmationRow(user);
    //   }
    //   //update email_confirmation
    //   try {
    //     const changeString = this.getChangeQueryString(
    //       emailConfirmationChanges,
    //     );
    //     const queryString = `UPDATE email_confirmation SET ${changeString} WHERE "userId"=${user.id}`;
    //     return await this.dataSource.query(queryString);
    //   } catch (e) {
    //     console.log(e);
    //     return null;
    //   }
    // }
    //
    // if (passwordRecoveryInformationChanges.length > 0) {
    //   const isExistRows = await this.dataSource.query(
    //     `SELECT * FROM password_recovery_information  WHERE "userId"=${user.id}`,
    //   );
    //   if (isExistRows.length < 1) {
    //     await this.insertPasswordRecoveryInfoRow(user);
    //   }
    //   //update
    //   try {
    //     const changeString = this.getChangeQueryString(
    //       passwordRecoveryInformationChanges,
    //     );
    //     const queryString = `UPDATE password_recovery_information SET ${changeString} WHERE "userId"=${user.id}`;
    //     await this.dataSource.query(queryString);
    //   } catch (e) {
    //     console.log(e);
    //     return null;
    //   }
    // }
    //
    // if (banInfoChanges.length > 0) {
    //   const isExistRows = await this.dataSource.query(
    //     `SELECT * FROM ban_info  WHERE "userId"=${user.id}`,
    //   );
    //   if (isExistRows.length < 1) {
    //     await this.insertBanInfoRow(user);
    //   }
    //   //update ban_info
    //   try {
    //     const changeString = this.getChangeQueryString(banInfoChanges);
    //     console.log(banInfoChanges);
    //     const queryString = `UPDATE ban_info SET ${changeString} WHERE "userId"=${user.id}`;
    //     console.log(queryString);
    //     await this.dataSource.query(queryString);
    //   } catch (e) {
    //     console.log(e);
    //     return null;
    //   }
    // }

    //deviceSession change
    //delete all sessions in DB for current user
    if (userFromDb.deviceSessions.length > 0) {
      let conditionString = '';
      for (let i = 0; i < userFromDb.deviceSessions.length; i++) {
        if (i === 0) {
          conditionString = `WHERE "deviceId"='${userFromDb.deviceSessions[i].deviceId}'`;
          continue;
        }
        conditionString += `OR "deviceId"='${userFromDb.deviceSessions[i].deviceId}'`;
      }

      const queryString = `DELETE FROM device_sessions ${conditionString}`;
      await this.dataSource.query(queryString);
    }
    //add new device sessions in DB if they are exist
    if (user.deviceSessions.length > 0) {
      await this.insertDeviceSessionRows(user);
    }
    return user.id;
  }
  private async insertNewUser(user: UserEntity) {
    try {
      const { accountData, emailConfirmation } = user;
      const { login, email, passwordSalt, passwordHash, createdAt } =
        accountData;
      const { isConfirmed } = emailConfirmation;

      const result = await this.dataSource.query(`
    INSERT INTO users("login", "email", "passwordHash", "passwordSalt", "createdAt", "isConfirmed") 
    VALUES ('${login}', '${email}', '${passwordHash}', '${passwordSalt}','${createdAt}', '${isConfirmed}')
    RETURNING id
    `);
      user.id = result[0].id;
      if (user.emailConfirmation.confirmationCode)
        await this.insertEmailConfirmationRow(user);
      return user.id;
    } catch (e) {
      console.log(e);
    }
  }

  private async insertEmailConfirmationRow(user: UserEntity) {
    try {
      const { confirmationCode, expirationDate, dateSendingConfirmEmail } =
        user.emailConfirmation;
      const queryString = `
        INSERT INTO email_confirmation 
            ("confirmationCode", "expirationDate", "dateSendingConfirmEmail", "userId")
        VALUES ('${confirmationCode}', '${expirationDate}', '${dateSendingConfirmEmail}', '${user.id}')
        `;
      await this.dataSource.query(queryString);
    } catch (e) {
      console.log(e);
    }
  }

  private async insertPasswordRecoveryInfoRow(user: UserEntity) {
    try {
      const { recoveryCode, expirationDate } = user.passwordRecoveryInformation;
      const queryString = `
        INSERT INTO password_recovery_information 
            ("recoveryCode", "expirationDate", "userId")
        VALUES ('${recoveryCode}', '${expirationDate}', '${user.id}')
        `;
      await this.dataSource.query(queryString);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async deletePasswordRecoveryInfoRow(user: UserEntity) {
    try {
      const queryString = `
        DELETE FROM password_recovery_information WHERE "userId"=${user.id} 
        `;
      await this.dataSource.query(queryString);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  private async insertDeviceSessionRows(user: UserEntity) {
    try {
      const sessions = user.deviceSessions;
      const valuesArray = sessions.map(
        (s) =>
          `('${s.deviceId}', '${s.ip}', '${s.title}', '${user.id}', '${s.lastActiveDate}', '${s.expiresDate}')`,
      );
      const values = valuesArray.join(',');
      await this.dataSource.query(
        `INSERT INTO device_sessions ("deviceId", ip, title, "userId", "lastActiveDate", "expiresDate") VALUES ${values}`,
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  }

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

  private async banUser(user: UserEntity) {
    try {
      if (user.banInfo.isBanned) {
        const { banReason, banDate } = user.banInfo;
        const queryString = `
        INSERT INTO ban_info 
            ("banDate", "banReason", "userId")
        VALUES ('${banDate}', '${banReason}',  '${user.id}');
        UPDATE users SET "isBanned"=true WHERE id=${user.id};
        `;
        await this.dataSource.query(queryString);
        return true;
      }
      const queryString = `
        DELETE FROM ban_info WHERE "userId"=${user.id};
        UPDATE users SET "isBanned"=false WHERE id=${user.id};
        `;
      await this.dataSource.query(queryString);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  private async confirmEmail(user: UserEntity) {
    try {
      const queryString = `
        UPDATE users SET "isConfirmed"=true WHERE id=${user.id};
        DELETE FROM email_confirmation WHERE "userId"=${user.id}
    `;
      await this.dataSource.query(queryString);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
