import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { UserEntity } from 'src/users/entities/user.entity';

@InputType()
export class ISeePostLikesInput {
  @Field(() => Int)
  postId: number;

  @Field(() => Int)
  offset: number;
}

@ObjectType()
export class ISeePostLikesOutput extends CoreOutput {
  @Field(() => [UserEntity], { nullable: true })
  users?: UserEntity[];

  @Field(() => Boolean, { defaultValue: false })
  hasNextPage?: boolean;
}
