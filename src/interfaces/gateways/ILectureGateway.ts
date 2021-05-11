import {Lecture} from '@/entities';

export default interface ILectureGateway {
  create: (lecture: Lecture) => Promise<Lecture>;
  get: (id: string) => Promise<Lecture | null>;
  update: (lecture: Lecture) => Promise<Lecture | null>;
  delete: (id: string) => Promise<Lecture | null>;
}
