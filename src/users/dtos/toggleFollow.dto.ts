import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';

@InputType()
export class IToggleFollowInput {
  @Field(() => Int)
  userId: number;
}

@ObjectType()
export class IToggleFollowOutput extends CoreOutput {}
