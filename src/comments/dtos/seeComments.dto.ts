import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { CommentEntity } from '../entities/comment.entity';

@InputType()
export class ISeeCommentsInput extends PickType(
  CommentEntity,
  ['postId'],
  InputType,
) {
  @Field(() => Int)
  lastId: number;
}

@ObjectType()
export class ISeeCommentsOutput extends CoreOutput {
  @Field(() => [CommentEntity], { nullable: true })
  comments?: CommentEntity[];
}
