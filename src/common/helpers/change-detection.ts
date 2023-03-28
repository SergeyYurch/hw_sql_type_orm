import { SchemaOfChangeDetectionType } from '../types/schema-of-change-detection.type';
import { DbChangesType } from '../types/db-changes.type';

export const changeDetection = (
  changedEntity,
  dbEntity,
  schema: SchemaOfChangeDetectionType[],
): DbChangesType[] => {
  const changes: DbChangesType[] = [];
  for (const t of schema) {
    const tableChange: DbChangesType = {
      table: t.tableName,
      changedFields: [],
    };

    const getValue = (obj: any, path: string) => {
      const keys = path.split('.');
      for (const key of keys) {
        obj = obj[key];
      }
      return obj;
    };
    const changedFields = [];
    for (const field of t.fields) {
      const newValue = getValue(changedEntity, field.fieldName);
      const oldValue = getValue(dbEntity, field.fieldName);
      if (newValue !== oldValue) {
        if (typeof newValue === 'boolean') {
          changedFields.push({
            field: `"${field.dbFiledName}"`,
            value: newValue,
          });
          continue;
        }
        if (typeof newValue === 'number') {
          changedFields.push({
            field: `"${field.dbFiledName}"`,
            value: newValue,
          });
          continue;
        }
        if (typeof newValue === 'object') {
          if (newValue instanceof Date) {
            changedFields.push({
              field: `"${field.dbFiledName}"`,
              value: newValue.getTime(),
            });
            continue;
          }
          continue;
        }

        changedFields.push({
          field: `"${field.dbFiledName}"`,
          value: `'${newValue}'`,
        });
      }
    }
    if (changedFields.length > 0) {
      tableChange.changedFields = changedFields;
      changes.push(tableChange);
    }
  }

  return changes;
};
