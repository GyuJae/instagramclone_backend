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
  ISeePostLikesInput,
  ISeePostLikesOutput,
} from './dtos/seePostLikes.dto';
import {
  ISeePostsByHashtagInput,
  ISeePostsByHashtagOutput,
} from './dtos/seePostsByHashtag.dto';
import {
  ISeeRecommendHashtagsInput,
  ISeeRecommendHashtagsOutput,
} from './dtos/seeRecommendHashtags.dto';
import { IToggleLikeInput, IToggleLikeOutput } from './dtos/toggleLike.dto';
import { FileEntity, HashtagEntity, PostEntity } from './entities/post.entity';

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
    { offset }: ISeeFeedInput,
    loggedInUser: UserEntity,
  ): Promise<ISeeFeedOutput> {
    try {
      const posts = await this.prismaService.post.findMany({
        take: 10,
        skip: offset,
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
        orderBy: {
          createdAt: 'desc',
        },
      });
      const count = await this.prismaService.post.count({
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
        hasNextPage: count > offset + 10,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async seePostLikes({
    postId,
    offset,
  }: ISeePostLikesInput): Promise<ISeePostLikesOutput> {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
        },
      });
      if (!post) throw new Error('Not Found Post by this post id');
      const users = await this.prismaService.user.findMany({
        where: {
          posts: {
            some: {
              id: post.id,
            },
          },
        },
        skip: offset,
        take: 10,
      });
      const count = await this.prismaService.user.count({
        where: {
          posts: {
            some: {
              id: post.id,
            },
          },
        },
      });
      return {
        ok: true,
        users,
        hasNextPage: count > offset + 10,
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
    lastId,
  }: ISearchPostsInput): Promise<ISearchPostsOutput> {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          caption: {
            contains: keyword,
          },
        },
        take: 20,
        skip: lastId ? 1 : 0,
        ...(lastId && { cursor: { id: lastId } }),
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
            startsWith: `#${keyword}`,
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

  async seePostsByHashtag({
    lastId,
    hashtag,
  }: ISeePostsByHashtagInput): Promise<ISeePostsByHashtagOutput> {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          hashtags: {
            some: {
              hashtag: `#${hashtag}`,
            },
          },
        },
        take: 20,
        skip: lastId ? 1 : 0,
        ...(lastId && { cursor: { id: lastId } }),
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

  async totalPost(hashtag: HashtagEntity): Promise<number> {
    return await this.prismaService.post.count({
      where: {
        hashtags: {
          some: {
            id: hashtag.id,
          },
        },
      },
    });
  }

  async files(post: PostEntity): Promise<FileEntity[]> {
    return this.prismaService.file.findMany({
      where: {
        id: post.id,
      },
    });
  }
}
