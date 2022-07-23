import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CraeteAccountInput,
  CreateAccountOutput,
} from './dtos/createAccount.dto';
import * as bcrypt from 'bcrypt';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { AuthService } from 'src/auth/auth.service';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import {
  IFindUserByIdInput,
  IFindUserByIdOutput,
} from './dtos/FindUserById.dto';
import { ISeeProfileInput, ISeeProfileOutput } from './dtos/seeProfile.dto';
import {
  IToggleFollowInput,
  IToggleFollowOutput,
} from './dtos/toggleFollow.dto';
import { UserEntity } from './entities/user.entity';
import {
  ISeeFollowingInput,
  ISeeFollowingOutput,
} from './dtos/seeFollowing.dto';
import {
  ISeeFollowersInput,
  ISeeFollowersOutput,
} from './dtos/seeFollowers.dto';
import { ISearchUsersInput, ISearchUsersOutput } from './dtos/searchUsers.dto';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  async findUserById({
    userId,
  }: IFindUserByIdInput): Promise<IFindUserByIdOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) throw new Error('User Not Found by this id');
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async createAccount({
    email,
    username,
    password,
  }: CraeteAccountInput): Promise<CreateAccountOutput> {
    try {
      const emailExist = await this.prismaService.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });
      if (emailExist) throw new Error('❌ This Email already exist.');

      const usernameExist = await this.prismaService.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });

      if (usernameExist) throw new Error('❌ This Username already exist.');

      const hashPassword = await bcrypt.hash(password, 10);
      await this.prismaService.user.create({
        data: {
          email,
          username,
          password: hashPassword,
        },
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
        select: { id: true, password: true },
      });
      if (!user) throw new Error('❌ Not Found User by this email.');

      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) throw new Error('❌ Wrong Password.');

      const { token } = await this.authService.sign({ userId: user.id });
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async editProfile(
    editProfileInput: EditProfileInput,
    userId: number,
  ): Promise<EditProfileOutput> {
    try {
      const currentUser = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
        },
      });
      if (!currentUser) throw new Error('❌ User Not Found.');
      await this.prismaService.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          ...editProfileInput,
        },
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async seeProfile({ username }: ISeeProfileInput): Promise<ISeeProfileOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          username,
        },
      });
      if (!user) throw new Error('Not Found User by this username');
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async toggleFollow(
    { username }: IToggleFollowInput,
    loggedInUser: UserEntity,
  ): Promise<IToggleFollowOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });
      if (!user) throw new Error('Not Found User');
      const isFollowing = await this.prismaService.user.findFirst({
        where: {
          id: loggedInUser.id,
          followings: {
            some: {
              id: user.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      if (!!isFollowing) {
        await this.prismaService.user.update({
          where: {
            id: loggedInUser.id,
          },
          data: {
            followings: {
              disconnect: {
                id: user.id,
              },
            },
          },
        });
      } else {
        await this.prismaService.user.update({
          where: {
            id: loggedInUser.id,
          },
          data: {
            followings: {
              connect: {
                id: user.id,
              },
            },
          },
        });
      }

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async seeFollowing({
    lastId,
    username,
  }: ISeeFollowingInput): Promise<ISeeFollowingOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });
      if (!user) throw new Error('Not Found User');

      const users = await this.prismaService.user.findUnique({
        where: {
          username,
        },
        include: {
          followings: {
            take: 20,
            skip: lastId ? 1 : 0,
            ...(lastId && { cursor: { id: lastId } }),
          },
        },
      });
      return {
        ok: true,
        users: users.followings,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async seeFollowers({
    username,
    lastId,
  }: ISeeFollowersInput): Promise<ISeeFollowersOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });
      if (!user) throw new Error('Not Found User');

      const users = await this.prismaService.user.findUnique({
        where: {
          username,
        },
        include: {
          followers: {
            take: 20,
            skip: lastId ? 1 : 0,
            ...(lastId && { cursor: { id: lastId } }),
          },
        },
      });
      return {
        ok: true,
        users: users.followers,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async searchUsers({
    keyword,
    lastId,
  }: ISearchUsersInput): Promise<ISearchUsersOutput> {
    try {
      const users = await this.prismaService.user.findMany({
        where: {
          username: {
            contains: keyword,
          },
        },
        take: 20,
        skip: lastId ? 1 : 0,
        ...(lastId && { cursor: { id: lastId } }),
      });
      return {
        ok: true,
        users,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async totalFollowing({ id }: UserEntity): Promise<number> {
    try {
      const totalFollowing = await this.prismaService.user.count({
        where: {
          followers: {
            some: {
              id,
            },
          },
        },
      });
      return totalFollowing;
    } catch {
      return 0;
    }
  }

  async totalFollower({ id }: UserEntity): Promise<number> {
    try {
      const totalFollower = await this.prismaService.user.count({
        where: {
          followings: {
            some: {
              id,
            },
          },
        },
      });
      return totalFollower;
    } catch {
      return 0;
    }
  }

  isMe(currentUser: UserEntity, loggedInUser: UserEntity): boolean {
    return currentUser.id === loggedInUser.id;
  }
}
