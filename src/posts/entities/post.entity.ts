import { Field, Int, ObjectType } from '@nestjs/graphql';
import { File, Hashtag, Post } from '@prisma/client';
import { CoreEntity } from 'src/core/entities/core.entity';

@ObjectType()
export class HashtagEntity extends CoreEntity implements Hashtag {
  @Field(() => String)
  hashtag: string;
}

@ObjectType()
export class FileEntity extends CoreEntity implements File {
  @Field(() => String)
  posterPath: string;

  @Field(() => Int)
  postId: number;
}

@ObjectType()
export class PostEntity extends CoreEntity implements Post {
  @Field(() => Int)
  userId: number;

  @Field(() => String)
  caption: string;
}
