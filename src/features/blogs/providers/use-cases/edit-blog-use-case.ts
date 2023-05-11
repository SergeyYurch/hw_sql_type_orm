import { BlogInputModel } from '../../dto/input-models/blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogEditDto } from '../../dto/blog-edit.dto';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';

export class EditBlogCommand {
  constructor(public blogId: string, public inputDate: BlogInputModel) {}
}

@CommandHandler(EditBlogCommand)
export class EditBlogUseCase implements ICommandHandler<EditBlogCommand> {
  constructor(
    private readonly blogRepository: BlogsTypeOrmRepository,
    private readonly blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
  ) {}

  async execute(command: EditBlogCommand) {
    const { blogId, inputDate } = command;
    const changes: BlogEditDto = {
      name: inputDate.name,
      websiteUrl: inputDate.websiteUrl,
      description: inputDate.description,
    };
    const editBlog = await this.blogsQueryTypeOrmRepository.getBlogModelById(
      blogId,
    );
    editBlog.blogUpdate(changes);
    return !!(await this.blogRepository.save(editBlog));
  }
}
