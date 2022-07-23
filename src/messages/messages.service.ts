import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  ICreateMessageRoomInput,
  ICreateMessageRoomOutput,
} from './dtos/createMessageRoom.dto';
import { ISeeRoomInput, ISeeRoomOutput } from './dtos/seeRoom.dto';
import { ISeeRoomsOutput } from './dtos/seeRooms.dto';
import { ISendMessageInput, ISendMessageOutput } from './dtos/sendMessage.dto';
import { MessageEntity, MessageRoomEntity } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(private readonly prismaService: PrismaService) {}

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

      await this.prismaService.message.create({
        data: {
          userId: loggedInUser.id,
          roomId: room.id,
          payload,
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

  async seeRoom({ roomId }: ISeeRoomInput): Promise<ISeeRoomOutput> {
    try {
      const room = await this.prismaService.messageRoom.findUnique({
        where: {
          id: roomId,
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
}
