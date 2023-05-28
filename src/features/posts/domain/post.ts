import { PostCreateDto } from '../dto/post-create.dto';
import { PostUpdateDto } from '../dto/post-update.dto';
import { LikeDetailsViewModel } from '../../../common/dto/view-models/like-details.view.model';
import { LikesCountsType } from '../../../common/types/likes-counts.type';
import { LikesInfoType } from '../../../common/types/likes-info.type';
import { Blog } from '../../blogs/domain/blog';
import { User } from '../../users/domain/user';
import { Like } from '../../likes/domain/like';
import { Column } from 'typeorm';
import { BloggerImage } from '../../image/domain/blogger-image';

export class Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogger: User;
  blog: Blog;
  createdAt: number;
  newestLikes: LikeDetailsViewModel[];
  likesCounts: LikesCountsType;
  updatedLike: Like | null;
  likes: LikesInfoType;
  icons: {
    main: BloggerImage;
    small: BloggerImage;
    middle: BloggerImage;
  } | null;

  constructor() {
    this.newestLikes = [];
    this.likesCounts = {
      likesCount: 0,
      dislikesCount: 0,
    };
    this.likes = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    };
    this.updatedLike = null;
    this.icons = null;
  }

  initial(postDto: PostCreateDto) {
    this.title = postDto.title;
    this.shortDescription = postDto.shortDescription;
    this.content = postDto.content;
    this.blog = postDto.blog;
    this.blogger = postDto.blogger;
    this.createdAt = Date.now();
  }

  updatePost(postDto: PostUpdateDto) {
    this.title = postDto.title;
    this.shortDescription = postDto.shortDescription;
    this.content = postDto.content;
  }
}
