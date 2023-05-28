import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BloggerImageEntity } from '../entities/blogger-image.entity';

@Injectable()
export class BlogsTypeOrmRepository {
  constructor(
    @InjectRepository(BloggerImageEntity)
    private readonly bloggerImageRepository: Repository<BloggerImageEntity>,
  ) {}

  async save(imageEntity: BloggerImageEntity) {
    try {
      return true;
    } catch (e) {
      console.log(e);
    }
  }
}
