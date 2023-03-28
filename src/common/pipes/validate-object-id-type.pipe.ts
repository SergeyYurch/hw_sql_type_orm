import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectIdTypePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!Types.ObjectId.isValid(value)) {
      throw new NotFoundException('Invalid blogId!!');
    }
    return value;
  }
}
