import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {CurrentUser} from '@/entities/valueObjects';
import config from '@/config';
import {BadRequestError} from '@/errors';
import {UserRoles} from '@/entities/enums';

const {
  app: {
    accessToken: {secret}
  }
} = config;

declare global {
  namespace Express {
    interface Request {
      currentUser: CurrentUser | null;
    }
  }
}

interface ICurrentUser {
  id: string;
  role: UserRoles;
}

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-access-token');
  if (!token) {
    req.currentUser = null;
  } else {
    try {
      const {id, role} = jwt.verify(token, secret) as ICurrentUser;
      const currentUser = new CurrentUser(id, role);
      req.currentUser = currentUser;
    } catch (err) {
      throw new BadRequestError('Invalid token provided.');
    }
  }
  next();
};
