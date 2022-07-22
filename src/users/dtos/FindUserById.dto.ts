import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { UserEntity } from '../entities/user.entity';

@InputType()
export class IFindUserByIdInput {
  @Field(() => Int)
  userId: number;
}

@ObjectType()
export class IFindUserByIdOutput extends CoreOutput {
  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity;
}
