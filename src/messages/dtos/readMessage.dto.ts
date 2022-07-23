import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';

@InputType()
export class IReadMessageInput {
  @Field(() => Int)
  messageId: number;
}

@ObjectType()
export class IReadMessageOutput extends CoreOutput {}
