import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageRoomResolver, MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

@Module({
  providers: [
    MessagesResolver,
    MessageRoomResolver,
    MessagesService,
    PrismaService,
  ],
})
export class MessagesModule {}
