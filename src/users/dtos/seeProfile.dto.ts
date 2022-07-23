import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { UserEntity } from '../entities/user.entity';

@InputType()
export class ISeeProfileInput {
  @Field(() => String)
  username: string;
}

@ObjectType()
export class ISeeProfileOutput extends CoreOutput {
  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity;
}
