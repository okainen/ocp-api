import {User} from '@/entities';
import {UserRoles} from '@/entities/enums';

class UserPersistenceModel {
  public readonly imgPath: string | undefined;

  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly username: string,
    public readonly firstName: string,
    public readonly lastName: string | undefined,
    public readonly role: UserRoles,
    public readonly isActive: boolean,
    imgPath: string | null,
    public readonly modifiedAt: Date,
    public readonly createdAt: Date
  ) {
    this.imgPath = imgPath || undefined;
  }
}

export default class UserMapper {
  public static toPersistence(user: User) {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      role,
      isActive,
      imgPath,
      modifiedAt,
      createdAt
    } = user;
    return new UserPersistenceModel(
      email,
      password,
      username,
      firstName,
      lastName,
      role,
      isActive,
      imgPath,
      modifiedAt,
      createdAt
    );
  }
}
