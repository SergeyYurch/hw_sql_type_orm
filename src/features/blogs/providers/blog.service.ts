import { BloggerImage } from '../../image/domain/blogger-image';
import { PhotoSizeViewModel } from '../../../common/dto/view-models/photo-size.view.model';
import { BlogEntity } from '../entities/blog.entity';
import { Blog } from '../domain/blog';
import { BlogViewModel } from '../dto/view-models/blog.view.model';
import { ImageService } from '../../image/providers/image.service';
import { BlogSaViewModel } from '../dto/view-models/blog-sa-view.model';

export class BlogService {
  constructor(private readonly imageService: ImageService) {}
  mapToPhotoSizeViewModel(image: BloggerImage): PhotoSizeViewModel {
    if (!image) return null;
    return {
      width: image.width,
      height: image.height,
      fileSize: image.fileSize,
      url: image.url,
    };
  }
  mapToBlogDomainModel(blogEntity: BlogEntity) {
    console.log('castToBlogModel was started');
    const blogModel: Blog = new Blog();
    blogModel.id = String(blogEntity.id);
    blogModel.name = blogEntity.name;
    if (blogEntity.blogOwner) {
      blogModel.blogOwnerId = String(blogEntity.blogOwner.id);
      blogModel.blogOwnerLogin = blogEntity.blogOwner.login;
    }
    blogModel.description = blogEntity.description;
    blogModel.websiteUrl = blogEntity.websiteUrl;
    blogModel.createdAt = +blogEntity.createdAt;
    blogModel.isMembership = blogEntity.isMembership;
    blogModel.isBanned = blogEntity.isBanned;
    blogModel.banDate = +blogEntity.banDate;
    if (blogEntity.bannedUsers?.length > 0) {
      blogModel.bannedUsers = blogEntity.bannedUsers.map((bu) => ({
        id: String(bu.userId),
        banDate: bu.banDate,
        banReason: bu.banReason,
        login: bu.user.login,
      }));
    } else {
      blogModel.bannedUsers = [];
    }
    if (blogEntity.wallpaper) {
      blogModel.wallpaper = this.imageService.castEntityToImageModel(
        blogEntity.wallpaper,
      );
    }
    if (blogEntity.icon) {
      blogModel.icon = this.imageService.castEntityToImageModel(
        blogEntity.icon,
      );
    }
    return blogModel;
  }
  mapToBlogViewModel(blog: Blog): BlogViewModel {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: blog.isMembership,
      images: {
        wallpaper: blog.wallpaper
          ? {
              url: blog.wallpaper.url,
              width: blog.wallpaper.width,
              height: blog.wallpaper.height,
              fileSize: blog.wallpaper.fileSize,
            }
          : null,
        main: blog.icon
          ? [
              {
                url: blog.icon.url,
                width: blog.icon.width,
                height: blog.icon.height,
                fileSize: blog.icon.fileSize,
              },
            ]
          : [],
      },
    };
  }
  mapToSaBlogViewModelWithOwner(blog: Blog): BlogSaViewModel | BlogViewModel {
    const blogView = this.mapToBlogViewModel(blog);
    const banInfo = {
      isBanned: blog.isBanned,
      banDate: blog.banDate ? new Date(blog.banDate).toISOString() : null,
    };
    const blogOwnerInfo = {
      userId: blog.blogOwnerId,
      userLogin: blog.blogOwnerLogin,
    };
    return { ...blogView, blogOwnerInfo, banInfo };
  }
}
