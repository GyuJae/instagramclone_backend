import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';

@Module({
  providers: [CommentsResolver, CommentsService, PrismaService],
})
export class CommentsModule {}
