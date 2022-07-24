import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class IRoomUpdatesInput {
  @Field(() => Int)
  roomId: number;
}
