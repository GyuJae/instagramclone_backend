import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';

@InputType()
export class IDeleteCommentInput {
  @Field(() => Int)
  commentId: number;
}

@ObjectType()
export class IDeleteCommentOutput extends CoreOutput {}
