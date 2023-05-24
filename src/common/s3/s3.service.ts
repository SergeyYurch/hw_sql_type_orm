import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });
  private readonly bucketS3 = this.configService.get('BUCKET');
  constructor(private readonly configService: ConfigService) {}

  async upload(folder: string, fileName: string, fileBuffer: Buffer) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketS3,
          Key: `${folder}/${fileName}`,
          Body: fileBuffer,
        }),
      );
      return true;
    } catch (e) {
      console.log('S3Service ERROR!!!!!!!!!!!!!!!!!!!!!');
      console.log(e);
      return false;
    }
  }

  async uploadImages(
    images: {
      folder: string;
      fileName: string;
      fileBuffer: Buffer;
    }[],
  ) {
    try {
      await Promise.all(
        images.map((im) =>
          this.s3Client.send(
            new PutObjectCommand({
              Bucket: this.bucketS3,
              Key: `${im.folder}/${im.fileName}`,
              Body: im.fileBuffer,
            }),
          ),
        ),
      );
      return true;
    } catch (e) {
      console.log('S3Service ERROR!!!!!!!!!!!!!!!!!!!!!');
      console.log(e);
      return false;
    }
  }
}
