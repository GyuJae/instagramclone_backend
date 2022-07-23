import { LoginInput, LoginOutput } from './dtos/login.dto';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CraeteAccountInput,
  CreateAccountOutput,
} from './dtos/createAccount.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { CurrentUser, Roles } from 'src/auth/auth.decorator';
import {
  IFindUserByIdInput,
  IFindUserByIdOutput,
} from './dtos/FindUserById.dto';
import { ISeeProfileInput, ISeeProfileOutput } from './dtos/seeProfile.dto';
import {
  IToggleFollowInput,
  IToggleFollowOutput,
} from './dtos/toggleFollow.dto';
import {
  ISeeFollowingInput,
  ISeeFollowingOutput,
} from './dtos/seeFollowing.dto';
import {
  ISeeFollowersInput,
  ISeeFollowersOutput,
} from './dtos/seeFollowers.dto';
import { ISearchUsersInput, ISearchUsersOutput } from './dtos/searchUsers.dto';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private userService: UsersService) {}

  @Query(() => IFindUserByIdOutput)
  async findUserById(
    @Args('input') findUserByIdInput: IFindUserByIdInput,
  ): Promise<IFindUserByIdOutput> {
    return this.userService.findUserById(findUserByIdInput);
  }

  @Query(() => ISeeProfileOutput)
  async seeProfile(
    @Args('input') seeProfileInput: ISeeProfileInput,
  ): Promise<ISeeProfileOutput> {
    return this.userService.seeProfile(seeProfileInput);
  }

  @Query(() => ISeeFollowingOutput)
  async seeFollowing(
    @Args('input') seeFollowingInput: ISeeFollowingInput,
  ): Promise<ISeeFollowingOutput> {
    return this.userService.seeFollowing(seeFollowingInput);
  }

  @Query(() => ISeeFollowersOutput)
  async seeFollowers(
    @Args('input') seeFollowersInput: ISeeFollowersInput,
  ): Promise<ISeeFollowersOutput> {
    return this.userService.seeFollowers(seeFollowersInput);
  }

  @Query(() => ISearchUsersOutput)
  async searchUsers(
    @Args('input') searchUsersInput: ISearchUsersInput,
  ): Promise<ISearchUsersOutput> {
    return this.userService.searchUsers(searchUsersInput);
  }

  @Mutation(() => CreateAccountOutput, { description: 'Create Account' })
  async createAccount(
    @Args('input') createAccountInput: CraeteAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.userService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput, { description: 'Login' })
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Roles('USER')
  @Mutation(() => EditProfileOutput, { description: 'Edit Profile' })
  async editProfile(
    @Args('input') editProfilInput: EditProfileInput,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<EditProfileOutput> {
    return this.userService.editProfile(editProfilInput, currentUser.id);
  }

  @Roles('USER')
  @Mutation(() => IToggleFollowOutput)
  async toggleFollow(
    @Args('input') toggleFollowInput: IToggleFollowInput,
    @CurrentUser() loggedInUser: UserEntity,
  ): Promise<IToggleFollowOutput> {
    return this.userService.toggleFollow(toggleFollowInput, loggedInUser);
  }
}
