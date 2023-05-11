export type UserSqlDataType = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  isBanned: boolean;
  isConfirmed: boolean;
  banReason: string | null;
  banDate: string | null;
  recoveryCode: string | null;
  recoveryPassCodeExpirationDate: string | null;
  confirmationCode: string | null;
  dateSendingConfirmEmail: string | null;
  confirmationCodeExpirationDate?: string | null;
};

export type DeviceSessionSqlType = {
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: number;
  expiresDate: number;
};
