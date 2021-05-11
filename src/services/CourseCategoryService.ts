import Joi from 'joi';
import {CourseCategory} from '@/entities';
import {UserRoles} from '@/entities/enums';
import {CurrentUser} from '@/entities/valueObjects';
import {BadRequestError, DataIntegrityError, NotFoundError} from '@/errors';
import {ICourseCategoryGateway} from '@/interfaces/gateways';
import {
  CreateCourseCategoryReqModel,
  UpdateCourseCategoryReqModel
} from '@/requestModels';
import {ObjectsHelper} from '@/helpers';
import {CourseCategoryResModel} from '../responseModels';
import {COURSE_CATEGORY_NOT_FOUND} from '@/constants/errors';
import {ICourseCategoryService} from '@/interfaces/services';
import {authorizeUser, validateId, getFieldsQuery} from './helpers/interfaces';

export default class CourseCategoryService implements ICourseCategoryService {
  constructor(
    private courseCategoryGateway: ICourseCategoryGateway,
    private authorizeUser: authorizeUser,
    private validateId: validateId,
    private getFieldsQuery: getFieldsQuery
  ) {}

  private entityToResModel(
    courseCategory: CourseCategory,
    currentUser: CurrentUser | null = null,
    fields: string[] | null = null
  ) {
    const {id, name, modifiedAt, createdAt} = fields
      ? ObjectsHelper.projection(courseCategory, fields)
      : courseCategory;
    if (currentUser && currentUser.role === UserRoles.ADMIN) {
      return new CourseCategoryResModel(id!, name, modifiedAt, createdAt);
    }
    return new CourseCategoryResModel(id!, name);
  }

  async create(
    currentUser: CurrentUser | null,
    reqModel: CreateCourseCategoryReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.ADMIN);

    const {name} = reqModel;
    const courseCategory = await this.courseCategoryGateway.create(
      new CourseCategory({
        name
      })
    );

    return this.entityToResModel(courseCategory);
  }

  async get(currentUser: CurrentUser | null, id: string, queryParams: any) {
    if (!this.validateId(id)) {
      throw new NotFoundError(COURSE_CATEGORY_NOT_FOUND);
    }

    const courseCategory = await this.courseCategoryGateway.get(id);
    if (!courseCategory) {
      throw new NotFoundError(COURSE_CATEGORY_NOT_FOUND);
    }

    const fields = this.getFieldsQuery(queryParams);
    return this.entityToResModel(courseCategory, currentUser, fields);
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateCourseCategoryReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.ADMIN);

    if (!this.validateId(id)) {
      throw new NotFoundError(COURSE_CATEGORY_NOT_FOUND);
    }

    const courseCategory = await this.courseCategoryGateway.get(id);
    if (!courseCategory) {
      throw new NotFoundError(COURSE_CATEGORY_NOT_FOUND);
    }

    const {name} = reqModel;
    const updatedCourseCategory = await this.courseCategoryGateway.update(
      courseCategory.update({
        name
      })
    );
    if (!updatedCourseCategory) {
      throw new DataIntegrityError(COURSE_CATEGORY_NOT_FOUND);
    }

    return this.entityToResModel(updatedCourseCategory, currentUser);
  }
}
