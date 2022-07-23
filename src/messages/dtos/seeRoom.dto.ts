import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { MessageRoomEntity } from '../entities/message.entity';

@InputType()
export class ISeeRoomInput {
  @Field(() => Int)
  roomId: number;
}

@ObjectType()
export class ISeeRoomOutput extends CoreOutput {
  @Field(() => MessageRoomEntity, { nullable: true })
  room?: MessageRoomEntity;
}
