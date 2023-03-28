import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { pagesCount } from '../../common/helpers/helpers';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { User, UserDocument } from '../domain/user.schema';
import { UserViewModel } from '../dto/view-models/user.view.model';
import { MeViewModel } from '../../common/dto/view-models/me.view.model';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async checkUserId(userId: string): Promise<boolean> {
    return !!(await this.UserModel.findById(userId));
  }
  async checkUserBanStatus(userId: string): Promise<boolean> {
    const user = await this.UserModel.findById(userId);
    return user.banInfo.isBanned;
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return await this.UserModel.findOne({
      $or: [
        { 'accountData.email': loginOrEmail },
        { 'accountData.login': loginOrEmail },
      ],
    }).exec();
  }

  async getUserById(
    id: string,
    withBanStatus?: boolean,
  ): Promise<UserViewModel | null> {
    const user = await this.UserModel.findById(id);
    if (!user) return null;
    return withBanStatus
      ? this.getUserSaViewModel(user)
      : this.getUserViewModel(user);
  }

  async getEmailConfirmationData(userId: string) {
    const user = await this.UserModel.findById(userId);
    if (!user) return null;
    return {
      email: user.accountData.email,
      confirmationCode: user.emailConfirmation.confirmationCode,
      expirationDate: user.emailConfirmation.expirationDate,
    };
  }

  async findUsers(
    paginatorParams: PaginatorInputType,
    searchLoginTerm?: string,
    searchEmailTerm?: string,
    banStatus?: string,
    withBanStatus = false,
  ) {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const searchQuery = [];
    let filter = {};
    if (searchLoginTerm)
      searchQuery.push({
        'accountData.login': new RegExp(searchLoginTerm, 'i'),
      });
    if (searchEmailTerm)
      searchQuery.push({
        'accountData.email': new RegExp(searchEmailTerm, 'i'),
      });
    if (banStatus === 'banned')
      searchQuery.push({
        'banInfo.isBanned': true,
      });

    if (banStatus === 'notBanned')
      searchQuery.push({
        'banInfo.isBanned': false,
      });
    if (searchQuery.length > 0) filter = { $or: searchQuery };
    const totalCount = await this.UserModel.countDocuments(filter);
    const result = await this.UserModel.find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [`accountData.${sortBy}`]: sortDirection });
    const items: UserViewModel[] = result.map((u) =>
      withBanStatus ? this.getUserSaViewModel(u) : this.getUserViewModel(u),
    );
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  getUserViewModel(user: User): UserViewModel {
    return {
      id: user._id.toString(),
      email: user.accountData.email,
      login: user.accountData.login,
      createdAt: user.accountData.createdAt.toISOString(),
    };
  }

  private getUserSaViewModel(user: User) {
    return {
      id: user._id.toString(),
      email: user.accountData.email,
      login: user.accountData.login,
      createdAt: user.accountData.createdAt.toISOString(),
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate
          ? new Date(+user.banInfo.banDate).toISOString()
          : null,
        banReason: user.banInfo.banReason,
      },
    };
  }

  async getMeInfo(userId: string) {
    const user = await this.UserModel.findById(userId);
    if (!user) return null;
    return this.getMeViewModel(user);
  }

  getMeViewModel(user: User): MeViewModel {
    return {
      login: user.accountData.login,
      email: user.accountData.email,
      userId: user._id.toString(),
    };
  }
}
