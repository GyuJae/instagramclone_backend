import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Message, MessageRoom } from '@prisma/client';
import { CoreEntity } from 'src/core/entities/core.entity';

@ObjectType()
export class MessageEntity extends CoreEntity implements Message {
  @Field(() => String)
  payload: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Boolean)
  read: boolean;
}

@ObjectType()
export class MessageRoomEntity extends CoreEntity implements MessageRoom {}
