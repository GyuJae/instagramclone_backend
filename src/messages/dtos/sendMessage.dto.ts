import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { MessageEntity } from '../entities/message.entity';

@InputType()
export class ISendMessageInput extends PickType(
  MessageEntity,
  ['payload', 'userId', 'roomId'],
  InputType,
) {}

@ObjectType()
export class ISendMessageOutput extends CoreOutput {}
