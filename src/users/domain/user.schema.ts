import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import {
  getConfirmationCode,
  getConfirmationEmailExpirationDate,
  getPasswordRecoveryCodeExpirationDate,
} from '../../common/helpers/helpers';
import { UserCreatDto } from '../dto/user-creat.dto';

@Schema()
export class AccountData {
  @Prop({ required: true, default: 'login' })
  login: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  passwordSalt: string;

  @Prop({ default: new Date() })
  createdAt: Date;
}

@Schema()
export class EmailConfirmation {
  @Prop({ required: false })
  confirmationCode: string;

  @Prop({ required: false })
  expirationDate: number;

  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop({ default: [] })
  dateSendingConfirmEmail: Date[];
}

@Schema()
export class PasswordRecoveryInformation {
  @Prop({ required: true })
  recoveryCode: string;

  @Prop({ required: true })
  expirationDate: number;
}

@Schema()
export class DeviceSessions {
  @Prop({ required: true })
  deviceId: string;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  lastActiveDate: number;
  @Prop({ required: true })
  expiresDate: number;
}

@Schema()
export class BanInfo {
  @Prop({ default: false })
  isBanned: boolean;
  @Prop()
  banDate: number | null;
  @Prop()
  banReason: string | null;
  @Prop()
  sa: string | null;
}

const AccountDataSchema = SchemaFactory.createForClass(AccountData);
const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
const PasswordRecoveryInformationSchema = SchemaFactory.createForClass(
  PasswordRecoveryInformation,
);
const DeviceSessionsSchema = SchemaFactory.createForClass(DeviceSessions);
const BanInfoSchema = SchemaFactory.createForClass(BanInfo);

@Schema()
export class User {
  _id: Types.ObjectId;
  @Prop({ default: false })
  sigIn: boolean;
  @Prop({ type: AccountDataSchema, required: true, _id: false })
  accountData: AccountData;
  @Prop({ type: EmailConfirmationSchema, required: true, _id: false })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: PasswordRecoveryInformationSchema, default: null, _id: false })
  passwordRecoveryInformation: null | PasswordRecoveryInformation;
  @Prop({ type: [DeviceSessionsSchema], default: [], _id: false })
  deviceSessions: DeviceSessions[];
  @Prop({ type: BanInfoSchema, default: null, _id: false })
  banInfo: null | BanInfo;

  async setPasswordHash(password: string) {
    this.accountData.passwordSalt = await bcrypt.genSalt(10);
    this.accountData.passwordHash = await bcrypt.hash(
      password,
      this.accountData.passwordSalt,
    );
  }

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
      if (!expiresDate || expiresDate < Date.now()) return false;
      if (
        !Number.isInteger(lastActiveDate) ||
        lastActiveDate < new Date(2020).getTime()
      )
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
      (s) => s.expiresDate > +new Date(),
    );
    if (this.deviceSessions.length === 0) {
      this.sigIn = false;
    }

    const deviceSession = this.deviceSessions.find(
      (s) => s.deviceId === deviceId,
    );
    return !!deviceSession && deviceSession.lastActiveDate === lastActiveDate;
  }

  async logout(deviceId: string) {
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
      createdAt: new Date(),
    };
    this.emailConfirmation = userDto.isConfirmed
      ? {
          confirmationCode: undefined,
          expirationDate: undefined,
          isConfirmed: true,
          dateSendingConfirmEmail: [],
        }
      : {
          confirmationCode: getConfirmationCode(),
          expirationDate: getConfirmationEmailExpirationDate(),
          isConfirmed: false,
          dateSendingConfirmEmail: [new Date()],
        };
    this.banInfo = {
      isBanned: false,
      banReason: null,
      banDate: null,
      sa: '',
    };
  }

  async refreshTokens(
    deviceId: string,
    expiresDate: number,
    lastActiveDate: number,
  ) {
    this.deviceSessions = this.deviceSessions.map((s) =>
      s.deviceId === deviceId
        ? { ...s, expiresDate: expiresDate, lastActiveDate: lastActiveDate }
        : s,
    );
  }

  confirmEmail() {
    this.emailConfirmation.isConfirmed = true;
  }

  async setNewPassword(newPassword) {
    this.accountData.passwordHash = await bcrypt.hash(
      newPassword,
      this.accountData.passwordSalt,
    );
    this.passwordRecoveryInformation = null;
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
    this.deviceSessions = this.deviceSessions.filter(
      (s) => s.expiresDate > +new Date(),
    );
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

  deleteSession(deviceId) {
    this.deviceSessions = this.deviceSessions.filter(
      (s) => s.deviceId !== deviceId,
    );
    if (this.deviceSessions.length === 0) {
      this.sigIn = false;
    }
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

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods = {
  initialize: User.prototype.initialize,
  setPasswordHash: User.prototype.setPasswordHash,
  signIn: User.prototype.signIn,
  validateDeviceSession: User.prototype.validateDeviceSession,
  logout: User.prototype.logout,
  validateCredentials: User.prototype.validateCredentials,
  refreshTokens: User.prototype.refreshTokens,
  confirmEmail: User.prototype.confirmEmail,
  generateNewEmailConfirmationCode:
    User.prototype.generateNewEmailConfirmationCode,
  generateNewPasswordRecoveryCode:
    User.prototype.generateNewPasswordRecoveryCode,
  setNewPassword: User.prototype.setNewPassword,
  getSessions: User.prototype.getSessions,
  deleteSessionsExclude: User.prototype.deleteSessionsExclude,
  deleteSession: User.prototype.deleteSession,
  ban: User.prototype.ban,
};
export type UserDocument = HydratedDocument<User>;
