import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  ICreateCommentInput,
  ICreateCommentOutput,
} from './dtos/createComment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createComment(
    { payload, postId }: ICreateCommentInput,
    loggedInUser: UserEntity,
  ): Promise<ICreateCommentOutput> {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
        },
      });
      if (!post) throw new Error('Not Found Post');

      await this.prismaService.comment.create({
        data: {
          payload,
          postId: post.id,
          userId: loggedInUser.id,
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
