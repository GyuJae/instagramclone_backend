import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';

@InputType()
export class IToggleLikeInput {
  @Field(() => Int)
  postId: number;
}

@ObjectType()
export class IToggleLikeOutput extends CoreOutput {}
