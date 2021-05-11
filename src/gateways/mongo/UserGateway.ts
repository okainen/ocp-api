import {Model} from 'mongoose';
import {User} from '@/entities';
import {UserMapper} from '@/mappers';
import {UserDoc} from './models/types';

export default class UserGateway {
  private UserModel: Model<UserDoc, {}, {}>;

  constructor(UserModel: Model<UserDoc, {}, {}>) {
    this.UserModel = UserModel;
  }

  private docToEntity(entityDoc: UserDoc) {
    const {
      _id: id,
      email,
      password,
      username,
      firstName,
      lastName,
      role,
      imgPath,
      isActive,
      modifiedAt,
      createdAt
    } = entityDoc;
    return new User({
      id,
      email,
      password,
      username,
      firstName,
      lastName,
      role,
      imgPath,
      isActive,
      modifiedAt,
      createdAt
    });
  }

  async get(id: string): Promise<User | null> {
    const entityDoc = await this.UserModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async getByEmail(email: string): Promise<User | null> {
    const entityDoc = await this.UserModel.findOne({email});
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async getByUsername(username: string): Promise<User | null> {
    const entityDoc = await this.UserModel.findOne({username});
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async create(entity: User): Promise<User> {
    const entityDoc = await this.UserModel.create(
      UserMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async update(entity: User): Promise<User | null> {
    const entityDoc = await this.UserModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      UserMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<User | null> {
    const entityDoc = await this.UserModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.UserModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
