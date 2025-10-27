import { Injectable, NotFoundException } from '@nestjs/common';
import { getBetterAuthDb } from '../better-auth-db';
import { ObjectId } from 'mongodb';

type BetterAuthUser = {
  _id: ObjectId;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
};

@Injectable()
export class UsersService {
  async findById(userId: string) {
    const db = await getBetterAuthDb();
    const users = db.collection<BetterAuthUser>('users');

    const query = ObjectId.isValid(userId)
      ? { _id: new ObjectId(userId) }
      : { id: userId };

    const user = await users.findOne(query);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name ?? null,
      image: user.image ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findMany() {
    const db = await getBetterAuthDb();
    const users = db.collection<BetterAuthUser>('users');

    const cursor = users.find({});
    const all = await cursor.toArray();

    return all.map((user) => ({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name ?? null,
      image: user.image ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
