import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Comment } from '@prisma/client';
import { CoreEntity } from 'src/core/entities/core.entity';

@ObjectType()
export class CommentEntity extends CoreEntity implements Comment {
  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  postId: number;

  @Field(() => String)
  payload: string;
}
