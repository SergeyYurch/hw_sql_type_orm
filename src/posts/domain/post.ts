import { PostCreateDto } from '../dto/post-create.dto';
import { PostUpdateDto } from '../dto/post-update.dto';
import { LikeType } from '../../common/types/like.type';
import { LikeDetailsViewModel } from '../../common/dto/view-models/like-details.view.model';
import { LikeDto } from '../../common/dto/like.dto';
import { LikesCountsType } from '../../common/types/likes-counts.type';
import { LikesInfoType } from '../../common/types/likes-info.type';
import { Blog } from '../../blogs/domain/blog';
import { User } from '../../users/domain/user';

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
  updatedLike: LikeType | null;
  likes: LikesInfoType;

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

  updateLikeStatus(like: LikeDto) {
    if (!this.updatedLike) {
      this.updatedLike = {
        ...like,
      };
      return true;
    }
    this.updatedLike.likeStatus = like.likeStatus;
    return true;
  }
}
