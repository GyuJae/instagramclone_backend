import { Inject } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser, Roles } from 'src/auth/auth.decorator';
import { NEW_MESSAGE, PUB_SUB } from 'src/core/core.constants';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  ICreateMessageRoomInput,
  ICreateMessageRoomOutput,
} from './dtos/createMessageRoom.dto';
import { ILastMessageOutput } from './dtos/lastMessage.dto';
import { IReadMessageInput, IReadMessageOutput } from './dtos/readMessage.dto';
import { IRoomUpdatesInput } from './dtos/roomUpdates.dto';
import { ISeeRoomInput, ISeeRoomOutput } from './dtos/seeRoom.dto';
import { ISeeRoomsOutput } from './dtos/seeRooms.dto';
import { ISendMessageInput, ISendMessageOutput } from './dtos/sendMessage.dto';
import { MessageEntity, MessageRoomEntity } from './entities/message.entity';
import { MessagesService } from './messages.service';

@Resolver(() => MessageEntity)
export class MessagesResolver {
  constructor(private readonly messageService: MessagesService) {}

  @Roles('USER')
  @ResolveField(() => UserEntity)
  async user(@Parent() message: MessageEntity): Promise<UserEntity> {
    return this.messageService.user(message);
  }

  @Roles('USER')
  @Mutation(() => ISendMessageOutput)
  async sendMessage(
    @Args('input') sendMessageInput: ISendMessageInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<ISendMessageOutput> {
    return this.messageService.sendMessage(sendMessageInput, loggedInUser);
  }

  @Roles('USER')
  @Mutation(() => IReadMessageOutput)
  async readMessage(
    @Args('input') readMessageInput: IReadMessageInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<IReadMessageOutput> {
    return this.messageService.readMessage(readMessageInput, loggedInUser);
  }
}

@Resolver(() => MessageRoomEntity)
export class MessageRoomResolver {
  constructor(
    private readonly messageService: MessagesService,
    @Inject(PUB_SUB) private readonly pusSub: PubSub,
  ) {}

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
  @ResolveField(() => Int)
  async unreadTotal(
    @Parent() room: MessageRoomEntity,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<number> {
    return this.messageService.unreadTotal(room, loggedInUser);
  }

  @Roles('USER')
  @ResolveField(() => ILastMessageOutput)
  async lastMessage(
    @Parent() room: MessageRoomEntity,
  ): Promise<ILastMessageOutput> {
    return this.messageService.lastMessage(room);
  }

  @Roles('USER')
  @Query(() => ISeeRoomOutput)
  async seeRoom(
    @Args('input') seeRoomInput: ISeeRoomInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<ISeeRoomOutput> {
    return this.messageService.seeRoom(seeRoomInput, loggedInUser);
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

  @Roles('USER')
  @Subscription(() => MessageEntity, {
    filter: (
      { roomUpdates }: { roomUpdates: MessageEntity },
      { input }: { input: IRoomUpdatesInput },
    ) => {
      return roomUpdates.roomId === input.roomId;
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roomUpdates(@Args('input') _: IRoomUpdatesInput) {
    return this.pusSub.asyncIterator(NEW_MESSAGE);
  }
}
