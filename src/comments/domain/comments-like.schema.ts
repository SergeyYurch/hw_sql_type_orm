import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusType } from '../../common/dto/input-models/like.input.model';

@Schema()
export class CommentsLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: false })
  userIsBanned: boolean;

  @Prop({ required: true })
  likeStatus: LikeStatusType;

  @Prop({ required: true, default: new Date() })
  addedAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}
export const CommentsLikeSchema = SchemaFactory.createForClass(CommentsLike);
