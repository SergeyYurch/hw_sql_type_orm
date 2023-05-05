import { v4 as uuidv4 } from 'uuid';

export const pagesCount = (totalCount: number, pageSize: number) =>
  Math.ceil(totalCount / pageSize);

export const getConfirmationCode = (): string => uuidv4();

export const getConfirmationEmailExpirationDate = () =>
  +process.env.CONFIRM_EMAIL_LIFE_PERIOD_SEC * 1000 + Date.now();

export const getPasswordRecoveryCodeExpirationDate = () =>
  +process.env.PASSWORD_RECOVERY_CODE_LIFE_PERIOD_SEC * 1000 + Date.now();

export const delay = async (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};
