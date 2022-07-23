import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  ICreateMessageRoomInput,
  ICreateMessageRoomOutput,
} from './dtos/createMessageRoom.dto';
import { ISendMessageInput, ISendMessageOutput } from './dtos/sendMessage.dto';

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
}
