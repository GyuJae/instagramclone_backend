import { CommentsService } from './comments.service';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
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
import { IEditCommentInput, IEditCommentOutput } from './dtos/editComment.dto';
import { CommentEntity } from './entities/comment.entity';
import { ISeeCommentsInput, ISeeCommentsOutput } from './dtos/seeComments.dto';

@Resolver(() => CommentEntity)
export class CommentsResolver {
  constructor(private readonly commentService: CommentsService) {}

  @ResolveField(() => UserEntity)
  async user(@Parent() comment: CommentEntity): Promise<UserEntity> {
    return this.commentService.user(comment);
  }

  @Roles('USER')
  @Query(() => ISeeCommentsOutput)
  async seeComments(
    @Args('input') seeCommentsInput: ISeeCommentsInput,
  ): Promise<ISeeCommentsOutput> {
    return this.commentService.seeComments(seeCommentsInput);
  }

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

  @Roles('USER')
  @Mutation(() => IEditCommentOutput)
  async editComment(
    @Args('input') editCommentInput: IEditCommentInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<IEditCommentOutput> {
    return this.commentService.editComment(editCommentInput, loggedInUser);
  }
}
