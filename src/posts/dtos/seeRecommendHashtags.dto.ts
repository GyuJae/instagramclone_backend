import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { HashtagEntity } from '../entities/post.entity';

@InputType()
export class ISeeRecommendHashtagsInput {
  @Field(() => String)
  keyword: string;
}

@ObjectType()
export class ISeeRecommendHashtagsOutput extends CoreOutput {
  @Field(() => [HashtagEntity], { nullable: true })
  hashtags?: HashtagEntity[];
}
