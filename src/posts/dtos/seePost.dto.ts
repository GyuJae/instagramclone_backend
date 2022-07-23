import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { PostEntity } from '../entities/post.entity';

@InputType()
export class ISeePostInput {
  @Field(() => Int)
  postId: number;
}

@ObjectType()
export class ISeePostOutput extends CoreOutput {
  @Field(() => PostEntity, { nullable: true })
  post?: PostEntity;
}
