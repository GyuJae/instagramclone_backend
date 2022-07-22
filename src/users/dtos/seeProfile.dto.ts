import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { UserEntity } from '../entities/user.entity';

@InputType()
export class ISeeProfileInput {
  @Field(() => String)
  username: string;
}

@ObjectType()
class IUserWithFollow extends UserEntity {
  @Field(() => [UserEntity])
  followers: UserEntity[];

  @Field(() => [UserEntity])
  followings: UserEntity[];
}

@ObjectType()
export class ISeeProfileOutput extends CoreOutput {
  @Field(() => IUserWithFollow, { nullable: true })
  user?: IUserWithFollow;
}
