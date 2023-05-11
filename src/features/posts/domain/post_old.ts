// import { PostCreateDto } from '../dto/post-create.dto';
// import { PostUpdateDto } from '../dto/post-update.dto';
// import { LikeType } from '../../common/types/like.type';
// import { LikeDetailsViewModel } from '../../common/dto/view-models/like-details.view.model';
// import { LikeDto } from '../../common/dto/like.dto';
// import { LikesCountsType } from '../../common/types/likes-counts.type';
// import { LikesInfoType } from '../../common/types/likes-info.type';
//
// export class Post {
//   id: string;
//   title: string;
//   shortDescription: string;
//   content: string;
//   bloggerId: string;
//   blogId: string;
//   blogName: string;
//   isBanned: boolean;
//   createdAt: number;
//   newestLikes: LikeDetailsViewModel[];
//   likesCounts: LikesCountsType;
//   updatedLike: LikeType | null;
//   likes: LikesInfoType;
//
//   constructor() {
//     this.isBanned = false;
//     this.newestLikes = [];
//     this.likesCounts = {
//       likesCount: 0,
//       dislikesCount: 0,
//     };
//     this.likes = {
//       likesCount: 0,
//       dislikesCount: 0,
//       myStatus: 'None',
//     };
//     this.updatedLike = null;
//   }
//
//   initial(postDto: PostCreateDto) {
//     this.title = postDto.title;
//     this.shortDescription = postDto.shortDescription;
//     this.content = postDto.content;
//     this.blogId = postDto.blogId;
//     this.bloggerId = postDto.bloggerId;
//     this.blogName = postDto.blogName;
//     this.createdAt = Date.now();
//   }
//
//   updatePost(postDto: PostUpdateDto) {
//     this.title = postDto.title;
//     this.shortDescription = postDto.shortDescription;
//     this.content = postDto.content;
//   }
//
//   banPost(isBanned: boolean) {
//     this.isBanned = isBanned;
//     return true;
//   }
//
//   updateLikeStatus(like: LikeDto) {
//     if (!this.updatedLike) {
//       this.updatedLike = {
//         ...like,
//       };
//       return true;
//     }
//     this.updatedLike.likeStatus = like.likeStatus;
//     return true;
//   }
// }
