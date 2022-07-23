import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
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
}
