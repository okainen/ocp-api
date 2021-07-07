import fs from 'fs';
import path from 'path';
import {Request, Response} from 'express';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {toJson} from './helpers';
import {BadRequestError} from '@/errors';
import config from '@/config';
import {ILectureService} from '@/interfaces/services';
import {RANGE_HEADER_MISSING} from '@/constants/errors';

const {
  app: {
    HOST,
    port,
    lectures: {videoDir}
  }
} = config;

export default class LectureController {
  constructor(private lectureService: ILectureService) {}

  create = async (req: Request, res: Response) => {
    const resModel = await this.lectureService.create(
      req.currentUser!,
      new CreateStepReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  get = async (req: Request, res: Response) => {
    const resModel = await this.lectureService.get(
      req.currentUser!,
      req.params.id,
      req.query
    );
    res.status(200).json(toJson(resModel));
  };

  getVideoStream = async (req: Request, res: Response) => {
    // ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
      throw new BadRequestError(RANGE_HEADER_MISSING);
    }

    // get name of the video file (e.g. q1StggR80Z5_dHi_B-myT.mp4)
    const fname = req.params.fname;

    // get video stats
    const videoPath = path.join(videoDir, fname);
    const videoSize = fs.statSync(videoPath).size;

    // parse Range
    const CHUNK_SIZE = 2 ** 20; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // create headers
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4'
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, {start, end});

    // stream the video chunk to the client
    videoStream.pipe(res);
  };

  update = async (req: Request, res: Response) => {
    const resModel = await this.lectureService.update(
      req.currentUser!,
      req.params.id,
      new UpdateStepReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };

  uploadVideo = async (req: Request, res: Response) => {
    const resModel = await this.lectureService.uploadVideo(
      req.currentUser,
      req.params.id,
      `${HOST}:${port}/${videoDir}/${req.file.filename}`
    );
    res.status(200).json(toJson(resModel));
  };

  delete = async (req: Request, res: Response) => {
    const resModel = await this.lectureService.delete(
      req.currentUser!,
      req.params.id
    );
    res.status(204).json(toJson(resModel));
  };
}
