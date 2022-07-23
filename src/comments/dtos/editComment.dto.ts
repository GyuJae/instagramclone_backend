import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { CommentEntity } from '../entities/comment.entity';

@InputType()
export class IEditCommentInput extends PickType(
  CommentEntity,
  ['id', 'payload'],
  InputType,
) {}

@ObjectType()
export class IEditCommentOutput extends CoreOutput {}
