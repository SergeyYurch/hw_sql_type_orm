import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class LoggerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckPostIdGuard');
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization.split(' ')[1];
    console.log(`[LoggerGuard]: accessToken: ${accessToken}`);
    return true;
  }
}
