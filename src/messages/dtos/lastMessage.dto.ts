import { Field, ObjectType } from '@nestjs/graphql';
import { MessageEntity } from '../entities/message.entity';

@ObjectType()
export class ILastMessageOutput {
  @Field(() => MessageEntity, { nullable: true })
  message?: MessageEntity;
}
