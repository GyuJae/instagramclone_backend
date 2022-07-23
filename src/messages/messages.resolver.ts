import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser, Roles } from 'src/auth/auth.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  ICreateMessageRoomInput,
  ICreateMessageRoomOutput,
} from './dtos/createMessageRoom.dto';
import { ISendMessageInput, ISendMessageOutput } from './dtos/sendMessage.dto';
import { MessageEntity, MessageRoomEntity } from './entities/message.entity';
import { MessagesService } from './messages.service';

@Resolver(() => MessageEntity)
export class MessagesResolver {
  constructor(private readonly messageService: MessagesService) {}

  @Roles('USER')
  @Mutation(() => ISendMessageOutput)
  async sendMessage(
    @Args('input') sendMessageInput: ISendMessageInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<ISendMessageOutput> {
    return this.messageService.sendMessage(sendMessageInput, loggedInUser);
  }
}

@Resolver(() => MessageRoomEntity)
export class MessageRoomResolver {
  constructor(private readonly messageService: MessagesService) {}

  @Roles('USER')
  @Mutation(() => ICreateMessageRoomOutput)
  async createMessageRoom(
    @Args('input') createMessageRoomInput: ICreateMessageRoomInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<ICreateMessageRoomOutput> {
    return this.messageService.createMessageRoom(
      createMessageRoomInput,
      loggedInUser,
    );
  }
}
