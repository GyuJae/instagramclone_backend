import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';

@InputType()
export class ICreateMessageRoomInput {
  @Field(() => Int)
  userId: number;
}

@ObjectType()
export class ICreateMessageRoomOutput extends CoreOutput {}
