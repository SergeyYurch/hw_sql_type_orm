import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../domain/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async getBlogModel(id: string) {
    return this.BlogModel.findById(id);
  }

  async createBlogModel() {
    return new this.BlogModel();
  }

  async deleteBlog(blogId: string) {
    const result = await this.BlogModel.deleteOne({
      _id: new Types.ObjectId(blogId),
    });
    return result.deletedCount === 1;
  }

  async save(blog): Promise<Blog> {
    const newBlog = await blog.save();
    return newBlog?._id?.toString();
  }
}
