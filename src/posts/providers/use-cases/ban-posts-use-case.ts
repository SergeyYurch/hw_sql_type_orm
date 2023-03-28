import { PostsRepository } from '../posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanPostDto } from '../../dto/ban-post.dto';

export class BanPostsCommand {
  constructor(public banInputData: BanPostDto) {}
}

@CommandHandler(BanPostsCommand)
export class BanPostsUseCase implements ICommandHandler<BanPostsCommand> {
  constructor(private postRepository: PostsRepository) {}

  async execute(command: BanPostsCommand): Promise<boolean> {
    const { userId, isBanned, blogId } = command.banInputData;
    let posts = [];
    if (userId)
      posts = await this.postRepository.getPostsModelsByUserId(userId);
    if (blogId)
      posts = await this.postRepository.getPostsModelsByBlogId(blogId);

    for (const postModel of posts) {
      postModel.banPost(isBanned);
      const result = await this.postRepository.save(postModel);
      if (!result) return false;
    }
    return true;
  }
}
