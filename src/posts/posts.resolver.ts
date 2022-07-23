import { IToggleLikeInput, IToggleLikeOutput } from './dtos/toggleLike.dto';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser, Roles } from 'src/auth/auth.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { ICreatePostInput, ICreatePostOutput } from './dtos/createPost.dto';
import { ISeeFeedOutput, ISeeFeedInput } from './dtos/seeFeed.dto';
import { PostsService } from './posts.service';

@Resolver()
export class PostsResolver {
  constructor(private readonly postService: PostsService) {}

  @Roles('USER')
  @Query(() => ISeeFeedOutput)
  async seeFeed(
    @Args('input') seeFeedInput: ISeeFeedInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<ISeeFeedOutput> {
    return this.postService.seeFeed(seeFeedInput, loggedInUser);
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
}
