import { CommentsService } from './comments.service';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  ICreateCommentInput,
  ICreateCommentOutput,
} from './dtos/createComment.dto';
import { CurrentUser, Roles } from 'src/auth/auth.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  IDeleteCommentInput,
  IDeleteCommentOutput,
} from './dtos/deleteComment.dto';

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

  @Roles('USER')
  @Mutation(() => IDeleteCommentOutput)
  async deleteComment(
    @Args('input') deleteCommentInput: IDeleteCommentInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<IDeleteCommentOutput> {
    return this.commentService.deleteComment(deleteCommentInput, loggedInUser);
  }
}
