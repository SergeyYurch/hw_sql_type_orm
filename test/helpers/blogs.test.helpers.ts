import { INestApplication } from '@nestjs/common';
import { BlogInputModel } from '../../src/features/blogs/dto/input-models/blog.input.model';
import request from 'supertest';
import { BlogViewModel } from '../../src/features/blogs/dto/view-models/blog.view.model';
import { PostInputModel } from '../../src/features/posts/dto/input-models/post.input.model';

export class BlogsTestHelpers {
  constructor(private app: INestApplication) {}
  generateBlogInputModel(n: number, ownerId: number): BlogInputModel {
    return {
      websiteUrl: `https://blogWebsite#${n}user${ownerId}.com`,
      name: `blog#${n}U:${ownerId}`,
      description: `description of blog#${n}user${ownerId}`,
    };
  }
  generatePostInputModel(blogId: string, n: number): PostInputModel {
    return {
      title: `post${n}Blog${blogId}`,
      shortDescription: `shortDescription${n}`,
      content: `content${n}`,
      blogId: blogId,
    };
  }
  async createBlog(accessToken, userId, n: number): Promise<BlogViewModel> {
    const blog = this.generateBlogInputModel(n, userId);
    const result = await request(this.app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessToken, { type: 'bearer' })
      .send(blog)
      .expect(201);
    return result.body;
  }

  async createPost(blogId: string, accessToken: string, n = 0) {
    const postInputModel = this.generatePostInputModel(blogId, n);
    const url = `/blogger/blogs/${blogId}/posts`;
    const newPost1 = await request(this.app.getHttpServer())
      .post(url)
      .auth(accessToken, { type: 'bearer' })
      .send(postInputModel)
      .expect(201);
  }
}
