import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { MessageRoomEntity } from '../entities/message.entity';

@ObjectType()
export class ISeeRoomsOutput extends CoreOutput {
  @Field(() => [MessageRoomEntity], { nullable: true })
  rooms?: MessageRoomEntity[];
}
