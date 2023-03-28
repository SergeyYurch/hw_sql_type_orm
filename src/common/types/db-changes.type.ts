export type DbChangesType = {
  table: string;
  changedFields: {
    field: string;
    value: any;
  }[];
};
