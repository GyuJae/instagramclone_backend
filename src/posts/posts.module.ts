import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashtagsResolver, PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  providers: [PostsResolver, PostsService, PrismaService, HashtagsResolver],
})
export class PostsModule {}
