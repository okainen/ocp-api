import Joi from 'joi';
import {EventEmitter} from 'events';
import {Course, Enrollment} from '@/entities';
import {UserRoles} from '@/entities/enums';
import {CurrentUser} from '@/entities/valueObjects';
import {
  BadRequestError,
  DataIntegrityError,
  ForbiddenError,
  NotFoundError
} from '@/errors';
import {
  ICourseCategoryGateway,
  ICourseGateway,
  IEnrollmentGateway,
  IFinishedCourseGateway
} from '@/interfaces/gateways';
import {CreateCourseReqModel, UpdateCourseReqModel} from '@/requestModels';
import {
  CourseForAdminResModel,
  CourseForAuthorResModel,
  CourseForNonStudentResModel,
  CourseForStudentResModel,
  FinishedCourseResModel
} from '@/responseModels/course';
import {ObjectsHelper} from '@/helpers';
import {
  COURSE_DELETED,
  COURSE_PROGRESS_RESET,
  STUDENT_UNENROLLED
} from '@/constants/events';
import {
  COURSE_CATEGORY_NOT_FOUND,
  COURSE_NOT_FOUND,
  ENROLLMENT_NOT_FOUND,
  INVALID_QUERY_PARAMS
} from '@/constants/errors';
import {ICourseService} from '@/interfaces/services';
import {authorizeUser, validateId, getFieldsQuery} from './helpers/interfaces';

export default class CourseService implements ICourseService {
  constructor(
    private courseGateway: ICourseGateway,
    private courseCategoryGateway: ICourseCategoryGateway,
    private finishedCourseGateway: IFinishedCourseGateway,
    private enrollmentGateway: IEnrollmentGateway,
    private authorizeUser: authorizeUser,
    private validateId: validateId,
    private getFieldsQuery: getFieldsQuery,
    private emitter: EventEmitter
  ) {}

  private async entityToResModel(
    course: Course,
    currentUser: CurrentUser | null = null,
    fields: string[] | null = null
  ) {
    const {
      id,
      authorId,
      name,
      description,
      isPublished,
      weekIds,
      categoryIds,
      modifiedAt,
      createdAt
    } = fields ? ObjectsHelper.projection(course, fields) : course;
    if (currentUser) {
      if (currentUser.role === UserRoles.STUDENT) {
        const studentId = currentUser.id;
        const courseId = course.id;

        const enrollment = await this.enrollmentGateway.get(
          courseId!,
          studentId
        );

        const isEnrolledIn = fields
          ? fields.includes('enrolledIn')
            ? !!enrollment
            : undefined
          : !!enrollment;

        if (enrollment) {
          const finishedCourse = await this.finishedCourseGateway.get(
            studentId,
            courseId!
          );

          if (finishedCourse) {
            const {score, createdAt} = finishedCourse;
            return new FinishedCourseResModel(
              id!,
              authorId,
              name,
              description,
              weekIds,
              categoryIds,
              isEnrolledIn,
              score,
              createdAt
            );
          }
        }

        return new CourseForStudentResModel(
          id!,
          authorId,
          name,
          description,
          weekIds,
          categoryIds,
          isEnrolledIn
        );
      }

      if (currentUser.role === UserRoles.AUTHOR) {
        return new CourseForAuthorResModel(
          id!,
          name,
          description,
          weekIds,
          categoryIds,
          isPublished,
          modifiedAt,
          createdAt
        );
      }

      if (currentUser.role === UserRoles.ADMIN) {
        return new CourseForAdminResModel(
          id!,
          authorId,
          name,
          description,
          weekIds,
          categoryIds,
          isPublished,
          modifiedAt,
          createdAt
        );
      }
    }

    return new CourseForNonStudentResModel(
      id!,
      authorId,
      name,
      description,
      weekIds,
      categoryIds
    );
  }

  async create(
    currentUser: CurrentUser | null,
    reqModel: CreateCourseReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const {name, description, categoryIds, isPublished} = reqModel;
    categoryIds.forEach(async categoryId => {
      if (!this.validateId(categoryId)) {
        throw new NotFoundError(COURSE_CATEGORY_NOT_FOUND);
      }

      const category = await this.courseCategoryGateway.get(categoryId);
      if (!category) {
        throw new BadRequestError(COURSE_CATEGORY_NOT_FOUND);
      }
    });

    const course = await this.courseGateway.create(
      new Course({
        authorId: currentUser!.id,
        name,
        description,
        categoryIds,
        isPublished
      })
    );

    return this.entityToResModel(course, currentUser, null);
  }

  private async getCourse(id: string) {
    if (!this.validateId(id)) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    const course = await this.courseGateway.get(id);
    if (!course) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    return course;
  }

  async get(currentUser: CurrentUser | null, id: string, queryParams: any) {
    const course = await this.getCourse(id);
    const fields = this.getFieldsQuery(queryParams);

    if (currentUser) {
      if (currentUser.role === UserRoles.AUTHOR) {
        if (course.authorId !== currentUser.id) {
          throw new ForbiddenError();
        }

        return await this.entityToResModel(course, currentUser, fields);
      }

      if (currentUser.role === UserRoles.ADMIN) {
        return await this.entityToResModel(course, currentUser, fields);
      }
    }

    if (!course.isPublished) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    if (currentUser) {
      return await this.entityToResModel(course, currentUser, fields);
    }
    return await this.entityToResModel(course, null, fields);
  }

  private nameQueryToRegex(name?: string) {
    // tokenizing query string by extracting words
    const nameTokens = name?.match(/\w+/g);
    return nameTokens
      ? new RegExp(`${nameTokens.map(token => `(?=.*\\b${token}\\b)`)}.*`, 'gi')
      : undefined;
  }

  private getCourseQueryParams(queryParams: any) {
    const querySchema = Joi.object({
      name: Joi.string(),
      authorId: Joi.string(),
      fields: Joi.string(),
      page: Joi.number()
    });

    if (querySchema.validate(queryParams).error) {
      throw new BadRequestError(INVALID_QUERY_PARAMS);
    }

    const validQueryParams = queryParams as {
      name?: string;
      authorId?: string;
      fields?: string;
      page?: number;
    };

    return {
      ...validQueryParams,
      name: this.nameQueryToRegex(validQueryParams.name),
      fields: validQueryParams.fields
        ? validQueryParams.fields.split(',')
        : null
    };
  }

  async getAll(currentUser: CurrentUser | null, queryParams: any) {
    const {name, authorId, fields, page} =
      this.getCourseQueryParams(queryParams);

    if (
      currentUser &&
      currentUser.role in [UserRoles.AUTHOR, UserRoles.ADMIN]
    ) {
      const filterParams = ObjectsHelper.deleteUndefinedFields({
        name: name,
        authorId:
          currentUser.role === UserRoles.AUTHOR ? currentUser.id : authorId
      });
      const courses = await this.courseGateway.getAll(
        filterParams,
        queryParams?.page
      );

      return await Promise.all(
        courses.map((course: Course) => {
          return this.entityToResModel(course, currentUser, fields);
        })
      );
    }

    const filterParams = ObjectsHelper.deleteUndefinedFields({
      authorId,
      name,
      isPublished: true
    });

    const courses = await this.courseGateway.getAll(filterParams, page);
    return await Promise.all(
      courses.map((course: Course) => {
        if (currentUser) {
          return this.entityToResModel(course, currentUser, fields);
        }
        return this.entityToResModel(course, null, fields);
      })
    );
  }

  async getAllCurrentUserEnrolledIn(
    currentUser: CurrentUser | null,
    queryParams: any
  ) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const {name, authorId, fields} = this.getCourseQueryParams(queryParams);

    const filterParams = ObjectsHelper.deleteUndefinedFields({
      authorId,
      name
    });

    const enrollments = await this.enrollmentGateway.getByStudentId(
      currentUser!.id
    );

    const courses = await Promise.all(
      enrollments.map(async enrollment => {
        const course = await this.courseGateway.get(enrollment.courseId);
        if (!course) {
          throw new DataIntegrityError(COURSE_NOT_FOUND);
        }
        return course;
      })
    );
    return courses
      .filter(course => {
        const {name} = filterParams;
        return name ? name.test(course.name) : true;
      })
      .map((course: Course) => {
        return this.entityToResModel(course, currentUser, fields);
      }) as CourseForStudentResModel[];
  }

  async enroll(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const course = await this.getCourse(id);

    await this.enrollmentGateway.create(
      new Enrollment({studentId: currentUser!.id, courseId: id})
    );

    return (await this.entityToResModel(
      course,
      currentUser
    )) as CourseForStudentResModel;
  }

  async unenroll(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const course = await this.getCourse(id);

    const enrollment = await this.enrollmentGateway.delete(id, currentUser!.id);
    if (!enrollment) {
      throw new NotFoundError(ENROLLMENT_NOT_FOUND);
    }

    await this.enrollmentGateway.delete(id, currentUser!.id);

    this.emitter.emit(STUDENT_UNENROLLED, {studentId: currentUser!.id, course});

    return (await this.entityToResModel(
      course,
      currentUser
    )) as CourseForStudentResModel;
  }

  async resetProgress(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const course = await this.getCourse(id);

    const enrollment = await this.enrollmentGateway.get(
      course.id!,
      currentUser!.id
    );
    if (!enrollment) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    this.emitter.emit(COURSE_PROGRESS_RESET, {
      studentId: currentUser!.id,
      course
    });

    return (await this.entityToResModel(
      course,
      currentUser
    )) as CourseForStudentResModel;
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateCourseReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const course = await this.getCourse(id);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    const {name, description, categoryIds, isPublished} = reqModel;
    if (categoryIds) {
      categoryIds.forEach(async categoryId => {
        const category = await this.courseCategoryGateway.get(categoryId);
        if (!category) {
          throw new BadRequestError(COURSE_CATEGORY_NOT_FOUND);
        }
      });
    }
    const updatedCourse = await this.courseGateway.update(
      course.update({
        name,
        description,
        categoryIds,
        isPublished
      })
    );
    if (!updatedCourse) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    return this.entityToResModel(updatedCourse, currentUser);
  }

  async uploadImg(
    currentUser: CurrentUser | null,
    id: string,
    imgPath: string
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const course = await this.getCourse(id);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    const updatedCourse = await this.courseGateway.update(
      course.update({imgPath})
    );
    if (!updatedCourse) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    return this.entityToResModel(updatedCourse, currentUser);
  }

  async delete(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, [UserRoles.ADMIN, UserRoles.AUTHOR]);

    const course = await this.getCourse(id);

    if (currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(COURSE_NOT_FOUND);
      }

      if (course.isPublished) {
        throw new ForbiddenError();
      }
    }

    const deletedCourse = await this.courseGateway.delete(id);
    if (!deletedCourse) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    this.emitter.emit(COURSE_DELETED, course);

    return this.entityToResModel(deletedCourse, currentUser);
  }
}
