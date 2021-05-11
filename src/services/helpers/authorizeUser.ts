import {UserRoles} from '@/entities/enums';
import {CurrentUser} from '@/entities/valueObjects';
import {ForbiddenError, UnauthorizedError} from '@/errors';

export default (
  currentUser: CurrentUser | null,
  permitted?: UserRoles | UserRoles[]
) => {
  if (!currentUser) {
    throw new UnauthorizedError();
  }

  if (permitted) {
    const permittedRoles = permitted as UserRoles[];
    if (permittedRoles.length) {
      if (!(currentUser.role in permittedRoles)) {
        throw new ForbiddenError();
      }
    }

    if (currentUser.role !== (permitted as UserRoles)) {
      throw new ForbiddenError();
    }
  }
};
