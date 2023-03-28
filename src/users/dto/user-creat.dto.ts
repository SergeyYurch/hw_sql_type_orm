export class UserCreatDto {
  login: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  isConfirmed: boolean;
}
