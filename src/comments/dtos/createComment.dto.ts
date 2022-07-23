import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { CommentEntity } from '../entities/comment.entity';

@InputType()
export class ICreateCommentInput extends PickType(
  CommentEntity,
  ['payload', 'postId'],
  InputType,
) {}

@ObjectType()
export class ICreateCommentOutput extends CoreOutput {}
