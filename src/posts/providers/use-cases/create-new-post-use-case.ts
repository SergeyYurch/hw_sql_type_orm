import { PostViewModel } from '../../dto/view-models/post.view.model';
import { CommandHandler } from '@nestjs/cqrs';
import { PostCreateDto } from '../../dto/post-create.dto';
import { BlogPostInputModel } from '../../../blogs/dto/input-models/blog-post.input.model';
import { BlogsQuerySqlRepository } from '../../../blogs/providers/blogs.query.sql.repository';
import { PostsSqlRepository } from '../posts.sql.repository';

export class CreateNewPostCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public postInputModel: BlogPostInputModel,
  ) {}
}

@CommandHandler(CreateNewPostCommand)
export class CreateNewPostUseCase {
  constructor(
    private postRepository: PostsSqlRepository,
    private blogQueryRepository: BlogsQuerySqlRepository,
  ) {}

  async execute(command: CreateNewPostCommand): Promise<PostViewModel | null> {
    const { userId, blogId, postInputModel } = command;
    const { shortDescription, content, title } = postInputModel;
    const createdPost = await this.postRepository.createModel();
    const blog = await this.blogQueryRepository.getBlogById(blogId);
    const postDto: PostCreateDto = {
      title,
      shortDescription,
      content,
      blogId,
      bloggerId: userId,
      blogName: blog.name,
    };
    await createdPost.initial(postDto);
    return await this.postRepository.save(createdPost);
  }
}
