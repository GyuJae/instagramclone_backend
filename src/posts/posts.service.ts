import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { processHashtags } from 'src/utils';
import { ICreatePostInput, ICreatePostOutput } from './dtos/createPost.dto';
import { ISeeFeedInput, ISeeFeedOutput } from './dtos/seeFeed.dto';

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
}
