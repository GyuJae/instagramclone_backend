import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser, Roles } from 'src/auth/auth.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  ICreateMessageRoomInput,
  ICreateMessageRoomOutput,
} from './dtos/createMessageRoom.dto';
import { ISeeRoomInput, ISeeRoomOutput } from './dtos/seeRoom.dto';
import { ISeeRoomsOutput } from './dtos/seeRooms.dto';
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
  @ResolveField(() => [UserEntity])
  async users(@Parent() room: MessageRoomEntity): Promise<UserEntity[]> {
    return this.messageService.users(room);
  }

  @Roles('USER')
  @ResolveField(() => [MessageEntity])
  async messages(@Parent() room: MessageRoomEntity): Promise<MessageEntity[]> {
    return this.messageService.messages(room);
  }

  @Roles('USER')
  @Query(() => ISeeRoomOutput)
  async seeRoom(
    @Args('input') seeRoomInput: ISeeRoomInput,
  ): Promise<ISeeRoomOutput> {
    return this.messageService.seeRoom(seeRoomInput);
  }

  @Roles('USER')
  @Query(() => ISeeRoomsOutput)
  async seeRooms(
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<ISeeRoomsOutput> {
    return this.messageService.seeRooms(loggedInUser);
  }

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
