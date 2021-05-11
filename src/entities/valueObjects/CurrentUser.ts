import {UserRoles} from '../enums';

export default class CurrentUser {
  constructor(public readonly id: string, public readonly role: UserRoles) {}
}
