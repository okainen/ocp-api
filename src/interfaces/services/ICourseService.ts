import {CurrentUser} from '@/entities/valueObjects';
import {CreateCourseReqModel, UpdateCourseReqModel} from '@/requestModels';
import {
  CourseForAuthorResModel,
  CourseForAdminResModel,
  CourseForStudentResModel,
  CourseForNonStudentResModel,
  FinishedCourseResModel
} from '@/responseModels/course';

type CourseResModel =
  | CourseForAuthorResModel
  | CourseForAdminResModel
  | CourseForStudentResModel
  | FinishedCourseResModel
  | CourseForNonStudentResModel;

export default interface ICourseService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateCourseReqModel
  ) => Promise<CourseForAuthorResModel>;

  get: (
    currentUser: CurrentUser | null,
    id: string,
    queryParams: any
  ) => Promise<CourseResModel>;

  getAll: (
    currentUser: CurrentUser | null,
    queryParams: any
  ) => Promise<CourseResModel[]>;

  getAllCurrentUserEnrolledIn: (
    currentUser: CurrentUser | null,
    queryParams: any
  ) => Promise<CourseForStudentResModel[]>;

  enroll: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<CourseForStudentResModel>;

  unenroll: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<CourseForStudentResModel>;

  resetProgress: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<CourseForStudentResModel>;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateCourseReqModel
  ) => Promise<CourseForAuthorResModel>;

  uploadImg: (
    currentUser: CurrentUser | null,
    id: string,
    imgPath: string
  ) => Promise<CourseForAuthorResModel>;

  delete: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<CourseForAuthorResModel>;
}
