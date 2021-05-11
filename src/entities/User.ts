import {UserRoles} from './enums';

export default class User {
  public readonly id?: string;
  public readonly email: string;
  public readonly password: string;
  public readonly username: string;
  public readonly firstName: string;
  public readonly lastName?: string;
  public readonly role: UserRoles;
  public readonly isActive: boolean = false;
  public readonly imgPath: string | null = null;
  public readonly modifiedAt: Date;
  public readonly createdAt: Date;

  constructor({
    id,
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
  }: {
    id?: string;
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName?: string;
    role: UserRoles;
    isActive?: boolean;
    imgPath?: string;
    modifiedAt?: Date;
    createdAt?: Date;
  }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.isActive = isActive || this.isActive;
    this.imgPath = imgPath === undefined ? this.imgPath : imgPath;

    const now = new Date();
    this.createdAt = createdAt || now;
    this.modifiedAt = modifiedAt || now;
  }

  update = ({
    email,
    password,
    username,
    firstName,
    lastName,
    isActive,
    imgPath
  }: {
    email?: string;
    password?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    imgPath?: string;
  }) =>
    new User({
      id: this.id,
      role: this.role,
      createdAt: this.createdAt,
      email: email || this.email,
      password: password || this.password,
      username: username || this.username,
      firstName: firstName || this.firstName,
      lastName: lastName || this.lastName,
      isActive,
      imgPath
    });
}
