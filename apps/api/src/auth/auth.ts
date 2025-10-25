import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, member, owner, ac } from './permissions';

const client = new MongoClient(process.env.DATABASE_URL!);
const db = client.db();

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  basePath: '/auth',
  database: mongodbAdapter(db),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  plugins: [
    organization({
      teams: { enabled: true },
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
  ],
});
