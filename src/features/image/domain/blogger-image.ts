import { ImageDataType } from '../types/image-data.type';

export class BloggerImage {
  id: number;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
  createdAt: Date;
  updatedAt: Date;
  setImageParams(url: string, data: ImageDataType) {
    this.url = url;
    this.width = data.width;
    this.height = data.height;
    this.fileSize = data.size;
    this.format = data.format;
  }
}
