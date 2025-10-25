import { createAccessControl } from 'better-auth/plugins/access';
import {
  defaultStatements,
  adminAc,
} from 'better-auth/plugins/organization/access';

export const statement = {
  ...defaultStatements,
  project: ['create', 'share', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

export const member = ac.newRole({
  project: ['create'],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  project: ['create', 'update'],
});

export const owner = ac.newRole({
  project: ['create', 'update', 'delete'],
});
