import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { PostCreateDto } from '../../dto/post-create.dto';
import { BlogPostInputModel } from '../../../blogs/dto/input-models/blog-post.input.model';
import { PostsTypeOrmRepository } from '../posts.type-orm.repository';
import { BlogsQueryTypeOrmRepository } from '../../../blogs/providers/blogs.query.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';

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
    private readonly commandBus: CommandBus,
    private postRepository: PostsTypeOrmRepository,
    private blogQueryRepository: BlogsQueryTypeOrmRepository,
    private usersQueryTypeormRepository: UsersQueryTypeormRepository,
  ) {}

  async execute(command: CreateNewPostCommand) {
    const { userId, blogId, postInputModel } = command;
    const { shortDescription, content, title } = postInputModel;
    const createdPost = await this.postRepository.createModel();
    const blog = await this.blogQueryRepository.getBlogDomainModelById(blogId);
    const blogger = await this.usersQueryTypeormRepository.getUserModelById(
      userId,
    );
    const postDto: PostCreateDto = {
      title,
      shortDescription,
      content,
      blog,
      blogger,
    };
    await createdPost.initial(postDto);
    return this.postRepository.save(createdPost);
  }
}
