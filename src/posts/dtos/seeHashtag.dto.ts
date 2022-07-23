import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { HashtagEntity } from '../entities/post.entity';

@InputType()
export class ISeeHashtagInput extends PickType(
  HashtagEntity,
  ['hashtag'],
  InputType,
) {}

@ObjectType()
export class ISeeHashtagOutput extends CoreOutput {
  @Field(() => HashtagEntity, { nullable: true })
  hashtag?: HashtagEntity;
}
