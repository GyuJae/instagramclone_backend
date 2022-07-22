import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';
import { UserEntity } from '../entities/user.entity';

@InputType()
export class IToggleFollowInput extends PickType(
  UserEntity,
  ['username'],
  InputType,
) {}

@ObjectType()
export class IToggleFollowOutput extends CoreOutput {}
