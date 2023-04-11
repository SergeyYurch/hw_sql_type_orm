import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user';
import { UserEntity } from '../entities/user.entity';
import { DeviceSessionsEntity } from '../entities/device-sessions.entity';
import { PasswordRecoveryInformationEntity } from '../entities/password-recovery-information.entity';
import { UsersQueryTypeormRepository } from './users.query-typeorm.repository';

@Injectable()
export class UsersTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected userQueryRepository: UsersQueryTypeormRepository,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(DeviceSessionsEntity)
    private readonly deviceSessionRepository: Repository<DeviceSessionsEntity>,
    @InjectRepository(PasswordRecoveryInformationEntity)
    private readonly passwordRecoveryInformationRepository: Repository<PasswordRecoveryInformationEntity>,
  ) {}

  async getUserModel(userId: string) {
    return this.userQueryRepository.findById(userId);
  }

  createUserModel() {
    return new User();
  }

  async deleteUser(userId: string) {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .delete()
      .from(UserEntity)
      .where('id = :id', { id: userId })
      .execute();
    return result.affected === 1;
  }

  async save(user: User) {
    try {
      console.log('start User save');
      let userEntity: UserEntity;
      if (!user.id) {
        userEntity = new UserEntity();
      } else {
        userEntity = await this.usersRepository.findOne({
          where: { id: +user.id },
          relations: {
            deviceSessions: true,
            passwordRecoveryInformation: true,
          },
        });
      }
      userEntity.login = user.accountData.login;
      userEntity.email = user.accountData.email;
      userEntity.passwordHash = user.accountData.passwordHash;
      userEntity.passwordSalt = user.accountData.passwordSalt;
      userEntity.createdAt = user.accountData.createdAt;
      userEntity.isBanned = user.banInfo?.isBanned;
      userEntity.banDate = user.banInfo?.banDate;
      userEntity.banReason = user.banInfo?.banReason;
      userEntity.isConfirmed = user.emailConfirmation?.isConfirmed;
      userEntity.confirmationCode = user.emailConfirmation?.confirmationCode;
      userEntity.expirationDate = user.emailConfirmation?.expirationDate;
      userEntity.dateSendingConfirmEmail =
        user.emailConfirmation?.dateSendingConfirmEmail;
      //try to map User to UserEntity and save model
      await this.usersRepository.save(userEntity);
      if (user.passwordRecoveryInformation) {
        const passwordRecoveryInformation =
          new PasswordRecoveryInformationEntity();
        passwordRecoveryInformation.recoveryCode =
          user.passwordRecoveryInformation.recoveryCode;
        passwordRecoveryInformation.expirationDate =
          user.passwordRecoveryInformation.expirationDate;
        passwordRecoveryInformation.userId = userEntity.id;
        console.log('save passwordRecoveryInformation');
        console.log(passwordRecoveryInformation);
        await this.passwordRecoveryInformationRepository.save(
          passwordRecoveryInformation,
        );
        userEntity.passwordRecoveryInformation = passwordRecoveryInformation;
      }
      const activeDeviceIds: string[] = [];
      if (user.deviceSessions?.length > 0) {
        for (const ds of user.deviceSessions) {
          activeDeviceIds.push(ds.deviceId);
          const deviceSession = new DeviceSessionsEntity();
          deviceSession.user = userEntity;
          deviceSession.deviceId = ds.deviceId;
          deviceSession.ip = ds.ip;
          deviceSession.title = ds.title;
          deviceSession.lastActiveDate = ds.lastActiveDate;
          deviceSession.expiresDate = ds.expiresDate;
          await this.deviceSessionRepository.save(deviceSession);
          userEntity.deviceSessions.push(deviceSession);
        }
      }
      if (userEntity.deviceSessions?.length > 0) {
        for (const ds of userEntity.deviceSessions) {
          if (!activeDeviceIds.includes(ds.deviceId)) {
            await this.deviceSessionRepository.delete({
              deviceId: ds.deviceId,
            });
          }
        }
      }
      return this.userQueryRepository.castToUserModel(userEntity);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
