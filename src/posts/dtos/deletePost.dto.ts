import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';

@InputType()
export class IDeletePostInput {
  @Field(() => Int)
  postId: number;
}

@ObjectType()
export class IDeletePostOutput extends CoreOutput {}
