import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, confirmationCode: string) {
    // console.log(`${new Date()}:send to ${email} code: ${confirmationCode}`);
    const result = await this.mailerService.sendMail({
      to: email,
      from: 'noreply@nestjs.com',
      subject: 'Confirmation email',
      template: 'email',
      context: {
        confirmationCode,
      },
    });
  }

  async sendPasswordRecoveryEmail(email: string, recoveryCode: string) {
    // console.log(`send to ${email} recoveryCode: ${recoveryCode}`);
    const result = await this.mailerService.sendMail({
      to: email,
      from: 'noreply@nestjs.com',
      subject: 'Password recovery email',
      template: 'password',
      context: {
        recoveryCode,
      },
    });

    return result;
  }
}
