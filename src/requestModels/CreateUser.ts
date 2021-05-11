import Joi from 'joi';
import {BadRequestError} from '@/errors';
import {UserRoles} from '@/entities/enums';
import { INVALID_INPUT } from '@/constants/errors';

export default class CreateUser {
  public readonly email: string;
  public readonly password: string;
  public readonly username: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly role: UserRoles;

  constructor(reqBody: any) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      username: Joi.string().min(2).max(18).required(),
      firstName: Joi.string().min(1).max(18).required(),
      lastName: Joi.string().min(1).max(18).required(),
      role: Joi.string().valid(
        UserRoles.ADMIN,
        UserRoles.AUTHOR,
        UserRoles.STUDENT
      )
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.email = reqBody.email;
    this.password = reqBody.password;
    this.username = reqBody.username;
    this.firstName = reqBody.firstName;
    this.lastName = reqBody.lastName;
    this.role = reqBody.role;
  }
}
