import { BlogCreatedDto } from '../dto/blog-created.dto';
import { BlogEditDto } from '../dto/blog-edit.dto';
import { BlogDbDtoSql } from '../types/blog-db-dto.sql';
import { SchemaOfChangeDetectionType } from '../../common/types/schema-of-change-detection.type';

export class BannedUser {
  id: string;
  login: string;
  banReason: string;
  banDate: number;
}

export class Blog {
  id: string;
  name: string;
  blogOwnerId: string;
  blogOwnerLogin: string;
  description: string;
  websiteUrl: string;
  createdAt: number;
  isMembership: boolean;
  isBanned: boolean;
  banDate: number | null;
  bannedUsers: BannedUser[];

  initial(inputDate: BlogCreatedDto) {
    this.name = inputDate.name;
    this.websiteUrl = inputDate.websiteUrl;
    this.description = inputDate.description;
    this.createdAt = Date.now();
    this.blogOwnerId = inputDate.blogOwnerId;
    this.blogOwnerLogin = inputDate.blogOwnerLogin;
    this.isMembership = false;
    this.isBanned = false;
    this.banDate = null;
    this.bannedUsers = [];
  }

  setDbData(blogDb: BlogDbDtoSql, bannedUsers: BannedUser[]) {
    this.id = blogDb.id;
    this.name = blogDb.name;
    this.websiteUrl = blogDb.websiteUrl;
    this.description = blogDb.description;
    this.createdAt = +blogDb.createdAt;
    this.blogOwnerId = blogDb.blogOwnerId;
    this.blogOwnerLogin = blogDb.blogOwnerLogin;
    this.isMembership = blogDb.isMembership;
    this.isBanned = blogDb.isBanned;
    this.banDate = +blogDb.banDate;
    this.bannedUsers = [];
    if (bannedUsers.length > 0) {
      this.bannedUsers = bannedUsers;
    }
  }

  blogUpdate(changes: BlogEditDto) {
    this.name = changes.name;
    this.description = changes.description;
    this.websiteUrl = changes.websiteUrl;
  }

  bindUser(userId, userLogin) {
    this.blogOwnerId = userId;
    this.blogOwnerLogin = userLogin;
  }

  banBlog(isBanned: boolean) {
    this.isBanned = isBanned;
    this.banDate = Date.now();
  }

  banUser(id: string, login: string, banReason: string, isBanned: boolean) {
    if (isBanned) {
      const bannedIds = this.bannedUsers.map((bu) => bu.id);
      if (!bannedIds.includes(id)) {
        this.bannedUsers.push({
          id,
          login,
          banDate: Date.now(),
          banReason,
        });
      }
    }
    if (!isBanned) {
      this.bannedUsers = this.bannedUsers.filter((item) => item.id !== id);
    }
  }
}

//determines the correspondence of the fields of the entity to the table and the fields of the database
export const blogSchemaDb: SchemaOfChangeDetectionType[] = [
  {
    tableName: 'blogs',
    fields: [
      { fieldName: 'name', dbFiledName: 'name' },
      { fieldName: 'blogOwnerId', dbFiledName: 'blogOwnerId' },
      { fieldName: 'description', dbFiledName: 'description' },
      { fieldName: 'websiteUrl', dbFiledName: 'websiteUrl' },
      { fieldName: 'isMembership', dbFiledName: 'isMembership' },
      { fieldName: 'isBanned', dbFiledName: 'isBanned' },
      { fieldName: 'banDate', dbFiledName: 'banDate' },
    ],
  },
];
