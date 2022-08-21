import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { HashtagEntity, PostEntity } from '../entities/post.entity';

@InputType()
export class ISeePostsByHashtagInput extends PickType(
  HashtagEntity,
  ['hashtag'],
  InputType,
) {
  @Field(() => Int, { nullable: true })
  offset?: number;
}

@ObjectType()
export class ISeePostsByHashtagOutput extends CoreOutput {
  @Field(() => [PostEntity], { nullable: true })
  posts?: PostEntity[];
}
