/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { betterAuth } from 'better-auth';
import { organization, admin } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@repo/database';
import { adminPermissions, member, owner, ac } from './permissions/index.js';

const authInternal = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? '',
  baseURL: process.env.BETTER_AUTH_URL ?? '',
  basePath: '/auth',
  database: prismaAdapter(prisma, { provider: 'mongodb' }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  trustedOrigins: ['http://localhost:3001'],
  redirects: { enabled: false },
  plugins: [
    admin(),
    organization({
      teams: { enabled: true },
      invitations: { enabled: true },
      ac,
      roles: { owner, admin: adminPermissions, member },
    }),
  ],
});

export const auth: ReturnType<typeof betterAuth> = authInternal;

export type AuthInstance = ReturnType<typeof betterAuth>;
