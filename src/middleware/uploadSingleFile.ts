import {Request} from 'express';
import multer from 'multer';
import path from 'path';
import {generateNanoId} from '@/helpers/';

export default (destination: string, mimepytes: Set<string>, name: string) =>
  multer({
    storage: multer.diskStorage({
      destination: (req: Request, file, cb) => {
        cb(null, destination);
      },
      filename: (req: Request, file, cb) => {
        cb(
          null,
          generateNanoId() + path.extname(file.originalname).toLowerCase()
        );
      }
    }),
    fileFilter: (req: Request, file, cb) => {
      if (path.extname(file.originalname) && mimepytes.has(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  }).single(name);
