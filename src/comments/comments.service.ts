import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  ICreateCommentInput,
  ICreateCommentOutput,
} from './dtos/createComment.dto';
import {
  IDeleteCommentInput,
  IDeleteCommentOutput,
} from './dtos/deleteComment.dto';
import { IEditCommentInput, IEditCommentOutput } from './dtos/editComment.dto';
import { ISeeCommentsInput, ISeeCommentsOutput } from './dtos/seeComments.dto';
import { CommentEntity } from './entities/comment.entity';

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

  async deleteComment(
    { commentId }: IDeleteCommentInput,
    loggedInUser: UserEntity,
  ): Promise<IDeleteCommentOutput> {
    try {
      const comment = await this.prismaService.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          id: true,
          userId: true,
        },
      });
      if (!comment) throw new Error('Not Found Comment');
      if (comment.userId !== loggedInUser.id)
        throw new Error('No Authorization');

      await this.prismaService.comment.delete({
        where: {
          id: comment.id,
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

  async editComment(
    { id: commentId, payload }: IEditCommentInput,
    loggedInUser: UserEntity,
  ): Promise<IEditCommentOutput> {
    try {
      const comment = await this.prismaService.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          id: true,
          userId: true,
        },
      });
      if (!comment) throw new Error('Not Found Comment');

      if (loggedInUser.id !== comment.userId)
        throw new Error('No Authorization');

      await this.prismaService.comment.update({
        where: {
          id: comment.id,
        },
        data: {
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

  async seeComments({
    postId,
  }: ISeeCommentsInput): Promise<ISeeCommentsOutput> {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
        },
      });
      if (!post) throw new Error('Not Fount Post');
      const comments = await this.prismaService.comment.findMany({
        where: {
          postId: post.id,
        },
      });
      return {
        ok: true,
        comments,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async user({ id: commentId }: CommentEntity): Promise<UserEntity> {
    const user = await this.prismaService.user.findFirst({
      where: {
        comments: {
          some: {
            id: commentId,
          },
        },
      },
    });
    return user;
  }
}
