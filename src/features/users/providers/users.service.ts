import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { User } from '../domain/user';

@Injectable()
export class UsersService {
  getPasswordSalt() {
    return bcrypt.genSalt(10);
  }
  getPasswordHash(password: string, passwordSalt: string) {
    return bcrypt.hash(password, passwordSalt);
  }
  mapToUserDomainModel(userEntity: UserEntity): User {
    console.log('castToUserModel');
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
    if (userEntity.deviceSessions && Array.isArray(userEntity.deviceSessions)) {
      user.deviceSessions = userEntity.deviceSessions.map((d) => ({
        deviceId: d.deviceId,
        ip: d.ip,
        title: d.title,
        lastActiveDate: +d.lastActiveDate,
        expiresDate: +d.expiresDate,
      }));
    } else user.deviceSessions = [];

    return user;
  }
}
