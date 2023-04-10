import {
  getConfirmationCode,
  getConfirmationEmailExpirationDate,
  getPasswordRecoveryCodeExpirationDate,
} from '../../common/helpers/helpers';
import { UserCreatDto } from '../dto/user-creat.dto';
import { SchemaOfChangeDetectionType } from '../../common/types/schema-of-change-detection.type';

export class AccountData {
  login: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: number;
}
export class EmailConfirmation {
  isConfirmed: boolean;
  confirmationCode: string | null;
  expirationDate: number | null;
  dateSendingConfirmEmail: number | null;
}

export class PasswordRecoveryInformation {
  recoveryCode: string;
  expirationDate: number;
}
export class DeviceSessions {
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: number;
  expiresDate: number;
}

export class BanInfo {
  isBanned: boolean;
  banDate: number | null;
  banReason: string | null;
  sa: string | null;
}

export class User {
  id: string;
  sigIn: boolean;
  accountData: AccountData;
  emailConfirmation: EmailConfirmation;
  passwordRecoveryInformation: null | PasswordRecoveryInformation;
  deviceSessions: DeviceSessions[];
  banInfo: null | BanInfo;

  async validateCredentials(passwordHash: string) {
    return (
      passwordHash === this.accountData.passwordHash &&
      this.emailConfirmation.isConfirmed
    );
  }

  async signIn(
    deviceId: string,
    ip: string,
    title: string,
    expiresDate: number,
    lastActiveDate: number,
  ) {
    try {
      //validate input data
      if (!ip || !title || !deviceId || !lastActiveDate) return false;
      if (!expiresDate || expiresDate < +new Date()) return false;
      if (!Number.isInteger(lastActiveDate) || lastActiveDate < +new Date(2020))
        return false;
      const deviceSession: DeviceSessions = {
        deviceId,
        ip,
        title,
        lastActiveDate,
        expiresDate,
      };
      this.sigIn = true;
      //delete expired sessions
      this.deviceSessions = this.deviceSessions.filter(
        (s) => s.expiresDate > +new Date(),
      );
      this.deviceSessions.push(deviceSession);
      return true;
    } catch (e) {
      return false;
    }
  }

  async validateDeviceSession(deviceId: string, lastActiveDate: number) {
    //delete expired sessions
    this.deviceSessions = this.deviceSessions.filter(
      (s) => s.expiresDate > Date.now(),
    );
    if (this.deviceSessions.length === 0) {
      this.sigIn = false;
    }

    const deviceSession = this.deviceSessions.find(
      (s) => s.deviceId === deviceId,
    );
    return !!deviceSession && deviceSession.lastActiveDate === lastActiveDate;
  }

  logout(deviceId: string) {
    this.deviceSessions = this.deviceSessions.filter(
      (s) => s.deviceId !== deviceId,
    );
    if (this.deviceSessions.length === 0) {
      this.sigIn = false;
    }
  }

  async initialize(userDto: UserCreatDto) {
    this.accountData = {
      login: userDto.login,
      email: userDto.email,
      passwordSalt: userDto.passwordSalt,
      passwordHash: userDto.passwordHash,
      createdAt: Date.now(),
    };
    this.emailConfirmation = userDto.isConfirmed
      ? {
          confirmationCode: null,
          expirationDate: null,
          isConfirmed: true,
          dateSendingConfirmEmail: null,
        }
      : {
          confirmationCode: getConfirmationCode(),
          expirationDate: getConfirmationEmailExpirationDate(),
          isConfirmed: false,
          dateSendingConfirmEmail: Date.now(),
        };
    this.banInfo = {
      isBanned: false,
      banReason: null,
      banDate: null,
      sa: '',
    };
  }

  refreshTokens(deviceId: string, expiresDate: number, lastActiveDate: number) {
    this.deviceSessions = this.deviceSessions.map((s) =>
      s.deviceId === deviceId
        ? { ...s, expiresDate: expiresDate, lastActiveDate: lastActiveDate }
        : s,
    );
  }

  confirmEmail() {
    this.emailConfirmation.isConfirmed = true;
  }

  generateNewEmailConfirmationCode() {
    this.emailConfirmation.confirmationCode = getConfirmationCode();
    this.emailConfirmation.expirationDate =
      getConfirmationEmailExpirationDate();
    return this.emailConfirmation.confirmationCode;
  }

  generateNewPasswordRecoveryCode() {
    this.passwordRecoveryInformation = {
      recoveryCode: getConfirmationCode(),
      expirationDate: getPasswordRecoveryCodeExpirationDate(),
    };
    return this.passwordRecoveryInformation.recoveryCode;
  }

  getSessions() {
    //delete expired sessions
    // this.deviceSessions = this.deviceSessions.filter(
    //   (s) => s.expiresDate > +new Date(),
    // );
    if (this.deviceSessions.length === 0) {
      this.sigIn = false;
    }
    return this.deviceSessions.map((s) => ({
      ip: s.ip,
      title: s.title,
      lastActiveDate: new Date(s.lastActiveDate),
      deviceId: s.deviceId,
    }));
  }

  deleteSessionsExclude(deviceId) {
    this.deviceSessions = this.deviceSessions.filter(
      (s) => s.deviceId === deviceId,
    );
  }
  validateIsUserOwnerSession(deviceId) {
    const deviceSessions = this.deviceSessions.filter(
      (s) => s.deviceId === deviceId,
    );
    return deviceSessions.length > 0;
  }
  deleteSession(deviceId) {
    this.deviceSessions = this.deviceSessions.filter(
      (s) => s.deviceId !== deviceId,
    );
    if (this.deviceSessions.length === 0) {
      this.sigIn = false;
    }
  }

  setPasswordHash(passHash: string) {
    this.accountData.passwordHash = passHash;
  }

  ban(isBanned, banReason: string, saId: string) {
    this.deviceSessions = [];
    this.banInfo = {
      isBanned,
      banDate: isBanned ? Date.now() : null,
      banReason: isBanned ? banReason : null,
      sa: saId,
    };
  }
}

//determines the correspondence of the fields of the entity to the table
// and the fields of the database

export const userSchemaDb: SchemaOfChangeDetectionType[] = [
  {
    tableName: 'users',
    fields: [
      { fieldName: 'accountData.login', dbFiledName: 'login' },
      { fieldName: 'accountData.email', dbFiledName: 'email' },
      { fieldName: 'accountData.passwordHash', dbFiledName: 'passwordHash' },
      { fieldName: 'accountData.passwordSalt', dbFiledName: 'passwordSalt' },
      {
        fieldName: 'emailConfirmation.isConfirmed',
        dbFiledName: 'isConfirmed',
      },
      { fieldName: 'banInfo.isBanned', dbFiledName: 'isBanned' },
    ],
  },
  {
    tableName: 'ban_info',
    fields: [
      { fieldName: 'banInfo.banDate', dbFiledName: 'banDate' },
      { fieldName: 'banInfo.banReason', dbFiledName: 'banReason' },
      { fieldName: 'banInfo.sa', dbFiledName: 'sa' },
    ],
  },
  {
    tableName: 'email_confirmation',
    fields: [
      {
        fieldName: 'emailConfirmation.confirmationCode',
        dbFiledName: 'confirmationCode',
      },
      {
        fieldName: 'emailConfirmation.expirationDate',
        dbFiledName: 'expirationDate',
      },
      {
        fieldName: 'emailConfirmation.dateSendingConfirmEmail',
        dbFiledName: 'dateSendingConfirmEmail',
      },
    ],
  },
  {
    tableName: 'password_recovery_information',
    fields: [
      {
        fieldName: 'passwordRecoveryInformation.recoveryCode',
        dbFiledName: 'recoveryCode',
      },
      {
        fieldName: 'passwordRecoveryInformation.expirationDate',
        dbFiledName: 'expirationDate',
      },
    ],
  },
];
