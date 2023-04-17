import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class TestingSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async dataBaseClear(): Promise<boolean> {
    console.log('dataBaseClear');
    await this.dataSource.query(
      `
      DELETE FROM likes;
      DELETE FROM comments;
      DELETE FROM posts;
      DELETE FROM blogs_banned_users;
      DELETE FROM blogs;
      DELETE FROM password_recovery_information;
      DELETE FROM device_sessions;
      DELETE FROM users;
      
    `,
    );
    // const result = await this.dataSource.query(`
    // CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
    // DECLARE
    // statements CURSOR FOR
    //     SELECT tablename FROM pg_tables
    //     WHERE tableowner = username AND schemaname = 'public';
    // BEGIN
    // FOR stmt IN statements LOOP
    //     EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    // END LOOP;
    // END;
    // $$ LANGUAGE plpgsql;
    //
    // SELECT truncate_tables ('postgres')
    // `);
    // console.log(result);
    return true;
  }
}
