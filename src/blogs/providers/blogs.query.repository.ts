import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.schema';
import { pagesCount } from '../../common/helpers/helpers';
import { BlogViewModel } from '../dto/view-models/blog.view.model';
import { PaginatorViewModel } from '../../common/dto/view-models/paginator.view.model';
import { BlogSaViewModel } from '../dto/view-models/blog-sa-view.model';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async checkBlogId(blogId: string): Promise<boolean> {
    return !!(await this.BlogModel.findById(blogId));
  }

  async findBlogs(
    paginatorParams,
    searchNameTerm,
    options?: { viewForSa?: boolean; blogOwnerId?: string },
  ): Promise<PaginatorViewModel<BlogViewModel>> {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    let filter: any;
    filter = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};
    if (!options?.viewForSa) filter = { ...filter, isBanned: false };
    if (options?.blogOwnerId) {
      filter = { ...filter, ...{ blogOwnerId: options.blogOwnerId } };
    }

    const totalCount = await this.BlogModel.countDocuments(filter);
    const result = await this.BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    const items: BlogViewModel[] = options?.viewForSa
      ? result.map((b) => this.getSaViewModelWithOwner(b))
      : result.map((b) => this.getBlogViewModel(b));
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async getBlogById(id: string): Promise<BlogViewModel | null> {
    const blog = await this.BlogModel.findById(id);
    if (!blog || blog.isBanned) return null;
    return this.getBlogViewModel(blog);
  }

  getBlogViewModel(blog: Blog): BlogViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }

  getSaViewModelWithOwner(blog: Blog): BlogSaViewModel | BlogViewModel {
    const blogView = this.getBlogViewModel(blog);
    const banInfo = {
      isBanned: blog.isBanned,
      banDate: blog.banDate?.toISOString() || null,
    };
    const blogOwnerInfo = {
      userId: blog.blogOwnerId,
      userLogin: blog.blogOwnerLogin,
    };
    return { ...blogView, blogOwnerInfo, banInfo };
  }

  async getBlogOwner(blogId: string) {
    const blog = await this.BlogModel.findById(blogId);
    return blog.blogOwnerId
      ? {
          userId: blog.blogOwnerId,
          userLogin: blog.blogOwnerLogin,
        }
      : null;
  }

  async getBannedUsers(
    blogId: string,
    paginatorParams: PaginatorInputType,
    searchLoginTerm: string,
  ) {
    const blog = await this.BlogModel.findById(blogId);
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    let users = blog.bannedUsers;
    if (searchLoginTerm)
      users = users.filter((u) => u.login.includes(searchLoginTerm));
    const totalCount = users.length;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const firstIndex = pageSize * (pageNumber - 1);
    const lastIndex =
      firstIndex + pageSize <= totalCount - 1
        ? firstIndex + pageSize
        : totalCount;
    let sortedUsers = [];
    if (sortBy === 'createdAt') {
      sortedUsers = users.sort((a, b) => {
        if (+a['banDate'] > +b['banDate']) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        if (+a['banDate'] < +b['banDate']) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        return 0;
      });
    }

    if (['banReason', 'login', 'id'].includes(sortBy)) {
      sortedUsers = users.sort((a, b) => {
        if (a[sortBy] > b[sortBy]) return sortDirection === 'asc' ? 1 : -1;
        if (a[sortBy] < b[sortBy]) return sortDirection === 'asc' ? -1 : 1;
        return 0;
      });
    }

    if (firstIndex > totalCount - 1) sortedUsers = [];
    if (firstIndex <= totalCount)
      sortedUsers = sortedUsers.slice(firstIndex, lastIndex);
    const items = sortedUsers.map((e) => ({
      id: e.id,
      login: e.login,
      banInfo: {
        isBanned: true,
        banDate: e.banDate,
        banReason: e.banReason,
      },
    }));

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async isUserBanned(userId: string, blogId: string) {
    const blog = await this.BlogModel.findById(blogId);
    const users = blog.bannedUsers.map((u) => u.id);
    return users.includes(userId);
  }
}
