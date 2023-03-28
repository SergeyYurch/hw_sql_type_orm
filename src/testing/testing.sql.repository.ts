import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class TestingSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async dataBaseClear(): Promise<boolean> {
    console.log('dataBaseClear');
    await this.dataSource.query(
      `
      DELETE FROM password_recovery_information;
      DELETE FROM email_confirmation;
      DELETE FROM device_sessions;
      DELETE FROM ban_info;
      DELETE FROM blogs_banned_users;
      DELETE FROM likes;
      DELETE FROM comments;
      DELETE FROM posts;
      DELETE FROM blogs;
      DELETE FROM users;
    `,
    );

    return true;
  }
}
