import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { PostEntity } from '../entities/post.entity';

@InputType()
export class ISearchPostsInput {
  @Field(() => String)
  keyword: string;

  @Field(() => Int)
  offset: number;
}

@ObjectType()
export class ISearchPostsOutput extends CoreOutput {
  @Field(() => [PostEntity], { nullable: true })
  posts?: PostEntity[];

  @Field(() => Boolean, { defaultValue: false })
  hasNextPage?: boolean;
}
