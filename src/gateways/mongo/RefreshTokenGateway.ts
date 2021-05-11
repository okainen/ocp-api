import {Model} from 'mongoose';
import {RefreshToken} from '@/entities';
import {IRefreshTokenGateway} from '@/interfaces/gateways';
import {RefreshTokenMapper} from '@/mappers';
import {RefreshTokenDoc} from './models/types';

export default class RefreshTokenGateway implements IRefreshTokenGateway {
  RefreshTokenModel: Model<RefreshTokenDoc, {}, {}>;

  constructor(RefreshTokenModel: Model<RefreshTokenDoc, {}, {}>) {
    this.RefreshTokenModel = RefreshTokenModel;
  }

  private docToEntity(entityDoc: RefreshTokenDoc) {
    const {_id: id, userId, ttl, createdAt} = entityDoc;
    return new RefreshToken({id, userId, ttl, createdAt});
  }

  async create(entity: RefreshToken): Promise<RefreshToken> {
    const entityDoc = await this.RefreshTokenModel.create(
      RefreshTokenMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async get(id: string): Promise<RefreshToken | null> {
    const entityDoc = await this.RefreshTokenModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async getByUserId(userId: string): Promise<RefreshToken | null> {
    const entityDoc = await this.RefreshTokenModel.findOne({userId});
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<RefreshToken | null> {
    const entityDoc = await this.RefreshTokenModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.RefreshTokenModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
