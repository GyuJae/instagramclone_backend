import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { PostEntity } from '../entities/post.entity';

@InputType()
export class IEditPostInput extends PickType(
  PostEntity,
  ['caption'],
  InputType,
) {
  @Field(() => Int)
  postId: number;
}

@ObjectType()
export class IEditPostOutput extends CoreOutput {}
