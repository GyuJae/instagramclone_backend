import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { processHashtags } from 'src/utils';
import { ICreatePostInput, ICreatePostOutput } from './dtos/createPost.dto';
import { ISeeFeedInput, ISeeFeedOutput } from './dtos/seeFeed.dto';
import { IToggleLikeInput, IToggleLikeOutput } from './dtos/toggleLike.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(
    { caption, files }: ICreatePostInput,
    loggedInUser: UserEntity,
  ): Promise<ICreatePostOutput> {
    try {
      let hashtagObj = [];
      if (caption) {
        hashtagObj = processHashtags(caption);
      }
      await this.prismaService.post.create({
        data: {
          caption,
          ...(hashtagObj.length > 0 && {
            hashtags: {
              connectOrCreate: hashtagObj,
            },
          }),
          files: {
            createMany: {
              data: files.map((file) => ({ posterPath: file })),
            },
          },
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

  async seeFeed(
    { lastId }: ISeeFeedInput,
    loggedInUser: UserEntity,
  ): Promise<ISeeFeedOutput> {
    try {
      const posts = await this.prismaService.post.findMany({
        take: 20,
        skip: lastId ? 1 : 0,
        ...(lastId && { cursor: { id: lastId } }),
        where: {
          OR: [
            {
              user: {
                followers: {
                  some: {
                    id: loggedInUser.id,
                  },
                },
              },
            },
            {
              userId: loggedInUser.id,
            },
          ],
        },
      });
      return {
        ok: true,
        posts,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async toggleLike(
    { postId }: IToggleLikeInput,
    loggedInUser: UserEntity,
  ): Promise<IToggleLikeOutput> {
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

      const like = await this.prismaService.like.findUnique({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId: post.id,
          },
        },
        select: {
          id: true,
        },
      });
      if (like) {
        await this.prismaService.like.delete({
          where: {
            id: like.id,
          },
        });
      } else {
        await this.prismaService.like.create({
          data: {
            userId: loggedInUser.id,
            postId: post.id,
          },
        });
      }
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
