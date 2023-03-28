// import { Strategy } from 'passport-local';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from '../../auth/providers/auth.service';
//
// @Injectable()
// export class BlogOwnerCheckStrategy extends PassportStrategy(
//   Strategy,
//   'blogOwnerCheck',
// ) {
//   constructor(private authService: AuthService) {}
//
//   async validate(loginOrEmail: string, password: string) {
//     const user = await this.authService.validateUser(loginOrEmail, password);
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }
