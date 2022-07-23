import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';

@InputType()
export class ICreatePostInput {
  @Field(() => String, { nullable: true })
  caption?: string;

  @Field(() => [String])
  files: string[];
}

@ObjectType()
export class ICreatePostOutput extends CoreOutput {}
