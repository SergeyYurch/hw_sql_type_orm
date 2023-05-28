import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { UploadImageParams } from '../../../../common/types/upload-image-params.type';

@Injectable()
export class S3Service {
  private readonly region = this.configService.getOrThrow('AWS_S3_REGION');
  private readonly bucketS3 = this.configService.get('BUCKET');
  private readonly s3Client: S3Client = new S3Client({
    region: this.region,
  });
  constructor(private readonly configService: ConfigService) {}

  async upload(params: UploadImageParams): Promise<string> {
    try {
      const { targetFolder, fileName, fileBuffer } = params;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketS3,
          Key: `${targetFolder}/${fileName}`,
          Body: fileBuffer,
        }),
      );
      return this.getFileUrl(targetFolder, fileName);
    } catch (e) {
      console.log('S3Service ERROR!!!!!!!!!!!!!!!!!!!!!');
      console.log(e);
      return null;
    }
  }

  private getFileUrl(targetFolder: string, fileName: string) {
    return `https://${this.bucketS3}.s3.${this.region}.amazonaws.com/${targetFolder}/${fileName}`;
  }
}
