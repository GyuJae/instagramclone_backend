import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { PostEntity } from '../entities/post.entity';

@InputType()
export class ISeeFeedInput {
  @Field(() => Int, { defaultValue: 0, nullable: true })
  offset?: number;
}

@ObjectType()
export class ISeeFeedOutput extends CoreOutput {
  @Field(() => [PostEntity], { nullable: true })
  posts?: PostEntity[];

  @Field(() => Boolean, { defaultValue: false })
  hasNextPage?: boolean;
}
