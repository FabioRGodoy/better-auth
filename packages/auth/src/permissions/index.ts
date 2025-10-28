import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

const member = ac.newRole({
  project: ["create"],
});

const adminPermissions = ac.newRole({
  ...adminAc.statements,
  project: ["create", "update"],
});

const owner = ac.newRole({
  project: ["create", "update", "delete"],
});

export { statement, ac, member, adminPermissions, owner };
