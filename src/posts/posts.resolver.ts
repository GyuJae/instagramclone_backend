import { IEditPostInput, IEditPostOutput } from './dtos/editPost.dto';
import { ISeePostInput, ISeePostOutput } from './dtos/seePost.dto';
import { IToggleLikeInput, IToggleLikeOutput } from './dtos/toggleLike.dto';
import {
  Args,
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
import { HashtagEntity, PostEntity } from './entities/post.entity';

@Resolver(() => PostEntity)
export class PostsResolver {
  constructor(private readonly postService: PostsService) {}

  @ResolveField(() => UserEntity)
  async user(@Parent() post: PostEntity): Promise<UserEntity> {
    return this.postService.user(post);
  }

  @ResolveField(() => HashtagEntity)
  async hashtags(@Parent() post: PostEntity): Promise<HashtagEntity[]> {
    return this.postService.hashtags(post);
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
  @Query(() => ISeeRecommendHashtagsOutput)
  async seeRecommendHashtags(
    @Args('input') seeRecommendHashtagsInput: ISeeRecommendHashtagsInput,
  ): Promise<ISeeRecommendHashtagsOutput> {
    return this.postService.seeRecommendHashtags(seeRecommendHashtagsInput);
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
