import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { UserEntity } from '../entities/user.entity';

@InputType()
export class ISeeFollowingInput extends PickType(
  UserEntity,
  ['username'],
  InputType,
) {
  @Field(() => Int, { nullable: true })
  lastId?: number;
}

@ObjectType()
export class ISeeFollowingOutput extends CoreOutput {
  @Field(() => [UserEntity], { nullable: true })
  users?: UserEntity[];
}
