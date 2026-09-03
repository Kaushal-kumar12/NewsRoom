// src/constants/roles.js

/*
|--------------------------------------------------------------------------
| Canonical NewsRoom Roles
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Always use these machine values internally.
| Human-readable labels should come from getRoleLabel().
|
|--------------------------------------------------------------------------
*/

export const ROLES = Object.freeze({
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMINISTRATOR",
  EDITOR: "EDITOR",
  AUTHOR: "AUTHOR",
  USER: "REGISTERED_USER",
});