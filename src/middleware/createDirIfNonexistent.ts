import {Request, Response, NextFunction} from 'express';
import fs from 'fs';

export default (dirname: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!fs.existsSync(dirname)) {
      await fs.promises.mkdir(dirname, {recursive: true});
    }
    next();
  };
