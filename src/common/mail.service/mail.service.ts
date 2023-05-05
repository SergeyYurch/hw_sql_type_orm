import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, confirmationCode: string) {
    await this.mailerService.sendMail({
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
    await this.mailerService.sendMail({
      to: email,
      from: 'noreply@nestjs.com',
      subject: 'Password recovery email',
      template: 'password',
      context: {
        recoveryCode,
      },
    });
  }
}
