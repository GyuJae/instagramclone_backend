import { Inject, Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { NEW_MESSAGE, PUB_SUB } from 'src/core/core.constants';
import { PrismaService } from 'src/prisma/prisma.service';
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

@Injectable()
export class MessagesService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async sendMessage(
    { roomId, payload }: ISendMessageInput,
    loggedInUser: UserEntity,
  ): Promise<ISendMessageOutput> {
    try {
      const room = await this.prismaService.messageRoom.findUnique({
        where: { id: roomId },
        select: { id: true },
      });
      if (!room) throw new Error('Not Found Room');

      const message = await this.prismaService.message.create({
        data: {
          userId: loggedInUser.id,
          roomId: room.id,
          payload,
        },
      });

      await this.pubSub.publish(NEW_MESSAGE, {
        roomUpdates: message,
      });

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async createMessageRoom(
    { userId }: ICreateMessageRoomInput,
    loggedInUser: UserEntity,
  ): Promise<ICreateMessageRoomOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });
      if (!user) throw new Error('Not Found User');
      const room = await this.prismaService.messageRoom.findFirst({
        where: {
          users: {
            some: {
              AND: [{ id: user.id }, { id: loggedInUser.id }],
            },
          },
        },
      });
      if (room) throw new Error('Already Exist');

      await this.prismaService.messageRoom.create({
        data: {
          users: {
            connect: [
              {
                id: user.id,
              },
              {
                id: loggedInUser.id,
              },
            ],
          },
        },
      });

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async seeRoom(
    { roomId }: ISeeRoomInput,
    loggedInUser: UserEntity,
  ): Promise<ISeeRoomOutput> {
    try {
      const room = await this.prismaService.messageRoom.findFirst({
        where: {
          id: roomId,
          users: {
            some: {
              id: loggedInUser.id,
            },
          },
        },
      });
      if (!room) throw new Error('Not Found Message Room');

      return {
        ok: true,
        room,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async seeRooms(loggedInUser: UserEntity): Promise<ISeeRoomsOutput> {
    try {
      const rooms = await this.prismaService.messageRoom.findMany({
        where: {
          users: {
            some: {
              id: loggedInUser.id,
            },
          },
        },
      });
      return {
        ok: true,
        rooms,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async readMessage(
    { messageId }: IReadMessageInput,
    loggedInUser: UserEntity,
  ): Promise<IReadMessageOutput> {
    try {
      const message = await this.prismaService.message.findFirst({
        where: {
          id: messageId,
          userId: {
            not: loggedInUser.id,
          },
          room: {
            users: {
              some: {
                id: loggedInUser.id,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });
      if (!message) throw new Error('Not Found Message');

      await this.prismaService.message.update({
        where: {
          id: message.id,
        },
        data: {
          read: true,
        },
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async user({ id }: MessageEntity): Promise<UserEntity> {
    return await this.prismaService.message
      .findUnique({
        where: {
          id,
        },
      })
      .user();
  }

  async users({ id }: MessageRoomEntity): Promise<UserEntity[]> {
    return await this.prismaService.user.findMany({
      where: {
        messageRooms: {
          some: {
            id,
          },
        },
      },
    });
  }

  async messages({ id: roomId }: MessageRoomEntity): Promise<MessageEntity[]> {
    return await this.prismaService.message.findMany({
      where: {
        roomId,
      },
    });
  }

  async unreadTotal(
    room: MessageRoomEntity,
    loggedInUser: UserEntity,
  ): Promise<number> {
    return this.prismaService.message.count({
      where: {
        read: false,
        roomId: room.id,
        user: {
          id: {
            not: loggedInUser.id,
          },
        },
      },
    });
  }

  async lastMessage({
    id: roomId,
  }: MessageRoomEntity): Promise<ILastMessageOutput> {
    const message = await this.prismaService.message.findFirst({
      where: {
        roomId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      message,
    };
  }

  async filterRoomUpdates(
    newMessage: MessageEntity,
    input: IRoomUpdatesInput,
    user: UserEntity,
  ): Promise<boolean> {
    try {
      if (newMessage.roomId !== input.roomId) return false;
      const room = await this.prismaService.messageRoom.findFirst({
        where: {
          id: newMessage.roomId,
          users: {
            some: {
              id: user.id,
            },
          },
        },
      });
      return !!room;
    } catch {
      return false;
    }
  }
}
