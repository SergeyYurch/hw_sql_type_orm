export interface APIErrorResultModel {
  errorsMessages: BadRequestFieldErrorType[];
}

export interface BadRequestFieldErrorType {
  message: string;
  field: string;
}
