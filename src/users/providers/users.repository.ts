import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../domain/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async getUserModel(userId: string) {
    return this.UserModel.findById(userId);
  }

  async createUserModel() {
    return new this.UserModel();
  }

  async deleteUser(userId: string) {
    const result = await this.UserModel.deleteOne({
      _id: new Types.ObjectId(userId),
    });
    return result.deletedCount === 1;
  }

  async save(user): Promise<string> {
    const userInDb = await user.save();
    return userInDb?._id?.toString();
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return await this.UserModel.findOne({
      $or: [
        { 'accountData.email': loginOrEmail },
        { 'accountData.login': loginOrEmail },
      ],
    }).exec();
  }

  async findUserByEmailConfirmationCode(code: string) {
    return await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    }).exec();
  }

  async findUserByPasswordRecoveryCode(recoveryCode: string) {
    return await this.UserModel.findOne({
      'passwordRecoveryInformation.recoveryCode': recoveryCode,
    }).exec();
  }
}
