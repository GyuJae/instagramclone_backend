import { CommentsService } from './comments.service';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  ICreateCommentInput,
  ICreateCommentOutput,
} from './dtos/createComment.dto';
import { CurrentUser, Roles } from 'src/auth/auth.decorator';
import { UserEntity } from 'src/users/entities/user.entity';

@Resolver()
export class CommentsResolver {
  constructor(private readonly commentService: CommentsService) {}

  @Roles('USER')
  @Mutation(() => ICreateCommentOutput)
  async createComment(
    @Args('input') createCommentInput: ICreateCommentInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<ICreateCommentOutput> {
    return this.commentService.createComment(createCommentInput, loggedInUser);
  }
}
