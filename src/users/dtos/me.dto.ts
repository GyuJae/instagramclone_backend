import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { UserEntity } from '../entities/user.entity';

@ObjectType()
export class IMeOutput extends CoreOutput {
  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity;
}
