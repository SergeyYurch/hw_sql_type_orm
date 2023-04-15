import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusType } from '../../common/dto/input-models/like.input.model';

@Schema()
export class LikeForPost {
  @Prop({ required: true })
  userId: string;

  @Prop()
  login: string;

  @Prop({ required: false, default: false })
  userIsBanned: boolean;

  @Prop({ required: true })
  likeStatus: LikeStatusType;

  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}
export const LikeForPostSchema = SchemaFactory.createForClass(LikeForPost);
