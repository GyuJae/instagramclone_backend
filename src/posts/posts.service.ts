import { Injectable } from '@nestjs/common';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { processHashtags } from 'src/utils';
import { ICreatePostInput, ICreatePostOutput } from './dtos/createPost.dto';
import { IDeletePostInput, IDeletePostOutput } from './dtos/deletePost.dto';
import { IEditPostInput, IEditPostOutput } from './dtos/editPost.dto';
import { ISearchPostsInput, ISearchPostsOutput } from './dtos/searchPosts.dto';
import { ISeeFeedInput, ISeeFeedOutput } from './dtos/seeFeed.dto';
import { ISeeHashtagInput, ISeeHashtagOutput } from './dtos/seeHashtag.dto';
import { ISeePostInput, ISeePostOutput } from './dtos/seePost.dto';
import {
  ISeeRecommendHashtagsInput,
  ISeeRecommendHashtagsOutput,
} from './dtos/seeRecommendHashtags.dto';
import { IToggleLikeInput, IToggleLikeOutput } from './dtos/toggleLike.dto';
import { HashtagEntity, PostEntity } from './entities/post.entity';

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

  async seePost({ postId }: ISeePostInput): Promise<ISeePostOutput> {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
      });
      if (!post) throw new Error('Not Found Post');
      return {
        ok: true,
        post,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async editPost(
    { postId, caption }: IEditPostInput,
    loggedInUser: UserEntity,
  ): Promise<IEditPostOutput> {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          hashtags: {
            select: {
              hashtag: true,
            },
          },
        },
      });
      if (!post) throw new Error('Not Found Post');
      if (post.userId !== loggedInUser.id) throw new Error('No Authorization');

      await this.prismaService.post.update({
        where: {
          id: post.id,
        },
        data: {
          caption,
          hashtags: {
            disconnect: post.hashtags,
            connectOrCreate: processHashtags(caption),
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

  async deletePost(
    { postId }: IDeletePostInput,
    loggedInUser: UserEntity,
  ): Promise<IDeletePostOutput> {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
          userId: true,
        },
      });
      if (!post) throw new Error('Not Found Post');
      if (post.userId !== loggedInUser.id) throw new Error('No Authorzation');

      await this.prismaService.post.delete({
        where: {
          id: post.id,
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

  async searchPosts({
    keyword,
  }: ISearchPostsInput): Promise<ISearchPostsOutput> {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          caption: {
            contains: keyword,
          },
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

  async seeRecommendHashtags({
    keyword,
  }: ISeeRecommendHashtagsInput): Promise<ISeeRecommendHashtagsOutput> {
    try {
      const hashtags = await this.prismaService.hashtag.findMany({
        where: {
          hashtag: {
            startsWith: keyword,
          },
        },
      });
      return {
        ok: true,
        hashtags,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async seeHashtag({ hashtag }: ISeeHashtagInput): Promise<ISeeHashtagOutput> {
    try {
      const hashtagResult = await this.prismaService.hashtag.findUnique({
        where: {
          hashtag,
        },
      });
      if (!hashtagResult) throw new Error('Not Found Hashtag');
      return {
        ok: true,
        hashtag: hashtagResult,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async user(post: PostEntity): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: post.userId,
      },
    });
    return user;
  }

  async hashtags(post: PostEntity): Promise<HashtagEntity[] | null> {
    const hashtags = await this.prismaService.hashtag.findMany({
      where: {
        posts: {
          some: {
            id: post.id,
          },
        },
      },
    });

    return hashtags;
  }

  async likeCount(post: PostEntity): Promise<number> {
    return await this.prismaService.like.count({
      where: {
        postId: post.id,
      },
    });
  }

  async commentCount(post: PostEntity): Promise<number> {
    return await this.prismaService.comment.count({
      where: {
        postId: post.id,
      },
    });
  }

  async comments(post: PostEntity): Promise<CommentEntity[]> {
    return await this.prismaService.comment.findMany({
      where: {
        postId: post.id,
      },
    });
  }

  async isLiked(post: PostEntity, loggedInUser: UserEntity): Promise<boolean> {
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
    return !!like;
  }
}
