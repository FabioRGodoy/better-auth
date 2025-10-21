import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';

const client = new MongoClient(process.env.DATABASE_URL!);
const db = client.db();

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: mongodbAdapter(db),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
});
