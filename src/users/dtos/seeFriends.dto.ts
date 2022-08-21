import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { UserEntity } from '../entities/user.entity';

@InputType()
export class ISeeFriendsInput {
  @Field(() => Int, { nullable: true })
  offset?: number;
}

@ObjectType()
export class ISeeFriendsOutput extends CoreOutput {
  @Field(() => [UserEntity], { nullable: true })
  users?: UserEntity[];
}
