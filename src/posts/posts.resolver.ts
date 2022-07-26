import { CommentEntity } from './../comments/entities/comment.entity';
import { IEditPostInput, IEditPostOutput } from './dtos/editPost.dto';
import { ISeePostInput, ISeePostOutput } from './dtos/seePost.dto';
import { IToggleLikeInput, IToggleLikeOutput } from './dtos/toggleLike.dto';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser, Roles } from 'src/auth/auth.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { ICreatePostInput, ICreatePostOutput } from './dtos/createPost.dto';
import { ISeeFeedOutput, ISeeFeedInput } from './dtos/seeFeed.dto';
import { PostsService } from './posts.service';
import { IDeletePostInput, IDeletePostOutput } from './dtos/deletePost.dto';
import { ISearchPostsInput, ISearchPostsOutput } from './dtos/searchPosts.dto';
import {
  ISeeRecommendHashtagsInput,
  ISeeRecommendHashtagsOutput,
} from './dtos/seeRecommendHashtags.dto';
import { FileEntity, HashtagEntity, PostEntity } from './entities/post.entity';
import { ISeeHashtagInput, ISeeHashtagOutput } from './dtos/seeHashtag.dto';
import {
  ISeePostsByHashtagInput,
  ISeePostsByHashtagOutput,
} from './dtos/seePostsByHashtag.dto';
import {
  ISeePostLikesInput,
  ISeePostLikesOutput,
} from './dtos/seePostLikes.dto';
import {
  ISeePostsByUsernameInput,
  ISeePostsByUsernameOutput,
} from './dtos/seePostsByUsername.dto';

@Resolver(() => PostEntity)
export class PostsResolver {
  constructor(private readonly postService: PostsService) {}

  @ResolveField(() => UserEntity)
  async user(@Parent() post: PostEntity): Promise<UserEntity> {
    return this.postService.user(post);
  }

  @ResolveField(() => [HashtagEntity], { nullable: true })
  async hashtags(@Parent() post: PostEntity): Promise<HashtagEntity[] | null> {
    return this.postService.hashtags(post);
  }

  @ResolveField(() => Int)
  async likeCount(@Parent() post: PostEntity): Promise<number> {
    return this.postService.likeCount(post);
  }

  @ResolveField(() => Int)
  async commentCount(@Parent() post: PostEntity): Promise<number> {
    return this.postService.commentCount(post);
  }

  @ResolveField(() => [CommentEntity])
  async comments(@Parent() post: PostEntity): Promise<CommentEntity[]> {
    return this.postService.comments(post);
  }

  @ResolveField(() => [FileEntity])
  async files(@Parent() post: PostEntity): Promise<FileEntity[]> {
    return this.postService.files(post);
  }

  @Roles('USER')
  @ResolveField(() => Boolean)
  isMine(
    @Parent() post: PostEntity,
    @CurrentUser() loggedInUser: UserEntity,
  ): boolean {
    return post.userId === loggedInUser.id;
  }

  @Roles('USER')
  @ResolveField(() => Boolean)
  async isLiked(
    @Parent() post: PostEntity,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<boolean> {
    return this.postService.isLiked(post, loggedInUser);
  }

  @Roles('USER')
  @Query(() => ISeePostOutput)
  async seePost(
    @Args('input') seePostInput: ISeePostInput,
  ): Promise<ISeePostOutput> {
    return this.postService.seePost(seePostInput);
  }

  @Roles('USER')
  @Query(() => ISeeFeedOutput)
  async seeFeed(
    @Args('input') seeFeedInput: ISeeFeedInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<ISeeFeedOutput> {
    return this.postService.seeFeed(seeFeedInput, loggedInUser);
  }

  @Roles('USER')
  @Query(() => ISearchPostsOutput)
  async searchPosts(
    @Args('input') searchPostsInput: ISearchPostsInput,
  ): Promise<ISearchPostsOutput> {
    return this.postService.searchPosts(searchPostsInput);
  }

  @Roles('USER')
  @Query(() => ISeePostsByHashtagOutput)
  async seePostsByHashtag(
    @Args('input') seePostsByHashtagInput: ISeePostsByHashtagInput,
  ): Promise<ISeePostsByHashtagOutput> {
    return this.postService.seePostsByHashtag(seePostsByHashtagInput);
  }

  @Roles('USER')
  @Query(() => ISeePostLikesOutput)
  async seePostLikes(
    @Args('input') seePostLikesInput: ISeePostLikesInput,
  ): Promise<ISeePostLikesOutput> {
    return this.postService.seePostLikes(seePostLikesInput);
  }

  @Roles('USER')
  @Query(() => ISeePostsByUsernameOutput)
  async seePostsByUsername(
    @Args('input') seePostsByUsernameInput: ISeePostsByUsernameInput,
  ): Promise<ISeePostsByUsernameOutput> {
    return this.postService.seePostsByUsername(seePostsByUsernameInput);
  }

  @Roles('USER')
  @Mutation(() => ICreatePostOutput)
  async createPost(
    @Args('input') createPostInput: ICreatePostInput,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ICreatePostOutput> {
    return this.postService.createPost(createPostInput, currentUser);
  }

  @Roles('USER')
  @Mutation(() => IToggleLikeOutput)
  async toggleLike(
    @Args('input') toggleLikeInput: IToggleLikeInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<IToggleLikeOutput> {
    return this.postService.toggleLike(toggleLikeInput, loggedInUser);
  }

  @Roles('USER')
  @Mutation(() => IEditPostOutput)
  async editPost(
    @Args('input') editPostInput: IEditPostInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<IEditPostOutput> {
    return this.postService.editPost(editPostInput, loggedInUser);
  }

  @Roles('USER')
  @Mutation(() => IDeletePostOutput)
  async deletePost(
    @Args('input') deletePostInput: IDeletePostInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<IDeletePostOutput> {
    return this.postService.deletePost(deletePostInput, loggedInUser);
  }
}

@Resolver(() => HashtagEntity)
export class HashtagsResolver {
  constructor(private readonly postService: PostsService) {}

  @ResolveField(() => Int)
  async totalPost(@Parent() hashtag: HashtagEntity) {
    return this.postService.totalPost(hashtag);
  }

  @Roles('USER')
  @Query(() => ISeeHashtagOutput)
  async seeHashtag(
    @Args('input') seeHashtagInput: ISeeHashtagInput,
  ): Promise<ISeeHashtagOutput> {
    return this.postService.seeHashtag(seeHashtagInput);
  }

  @Roles('USER')
  @Query(() => ISeeRecommendHashtagsOutput)
  async seeRecommendHashtags(
    @Args('input') seeRecommendHashtagsInput: ISeeRecommendHashtagsInput,
  ): Promise<ISeeRecommendHashtagsOutput> {
    return this.postService.seeRecommendHashtags(seeRecommendHashtagsInput);
  }
}
