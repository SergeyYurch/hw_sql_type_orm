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

export type Changes = { field: string; value: any };
export const changeDetection = (newData, dbData): Changes[] => {
  const changes: Changes[] = [];
  for (const key in newData) {
    console.log('changeDetection');
    console.log(`key=${key}`);
    console.log(`newData[key]=${newData[key]}`);
    if (newData[key] !== dbData[key]) {
      if (typeof newData[key] === 'boolean') {
        changes.push({
          field: `"${key}"`,
          value: newData[key],
        });
        continue;
      }
      if (typeof newData[key] === 'number') {
        changes.push({
          field: `"${key}"`,
          value: newData[key],
        });
        continue;
      }
      if (typeof newData[key] === 'object') {
        if (newData[key] instanceof Date) {
          changes.push({
            field: `"${key}"`,
            value: newData[key].getTime(),
          });
          continue;
        }
        continue;
      }

      changes.push({
        field: `"${key}"`,
        value: `'${newData[key]}'`,
      });
    }
  }
  return changes;
};
