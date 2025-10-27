import { betterAuth } from 'better-auth';
import { organization, admin } from 'better-auth/plugins';
import { adminPermissions, member, owner, ac } from './permissions';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@repo/database';

const authInternal = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  basePath: '/auth',
  database: prismaAdapter(prisma, { provider: 'mongodb' }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  trustedOrigins: ['http://localhost:30001'],
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

export const auth = authInternal;

export type AuthInstance = typeof auth;
