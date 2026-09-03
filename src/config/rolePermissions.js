// src/config/rolePermissions.js

/*
|--------------------------------------------------------------------------
| NEWSROOM RBAC FOUNDATION
|--------------------------------------------------------------------------
|
| SINGLE SOURCE OF TRUTH FOR:
|
| - Application roles
| - Permissions
| - Role permissions
| - Role normalization
| - Role checks
| - Permission checks
| - Role labels
| - Dashboard routing
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| CANONICAL ROLES
|--------------------------------------------------------------------------
|
| These exact values should be stored in Firestore.
|
| SUPER_ADMIN
| ADMINISTRATOR
| EDITOR
| AUTHOR
| REGISTERED_USER
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


/*
|--------------------------------------------------------------------------
| PERMISSIONS
|--------------------------------------------------------------------------
*/

export const PERMISSIONS = Object.freeze({

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  DASHBOARD_VIEW:
    "dashboard.view",


  /*
  |--------------------------------------------------------------------------
  | News
  |--------------------------------------------------------------------------
  */

  NEWS_READ:
    "news.read",

  NEWS_CREATE:
    "news.create",

  NEWS_EDIT_OWN:
    "news.edit.own",

  NEWS_EDIT_ANY:
    "news.edit.any",

  NEWS_DELETE_OWN:
    "news.delete.own",

  NEWS_DELETE_ANY:
    "news.delete.any",

  NEWS_SUBMIT:
    "news.submit",

  NEWS_REVIEW:
    "news.review",

  NEWS_APPROVE:
    "news.approve",

  NEWS_PUBLISH:
    "news.publish",

  NEWS_SCHEDULE:
    "news.schedule",

  NEWS_REJECT:
    "news.reject",

  NEWS_FORWARD_SUPERADMIN:
    "news.forward.superadmin",


  /*
  |--------------------------------------------------------------------------
  | Users
  |--------------------------------------------------------------------------
  */

  USERS_READ:
    "users.read",

  USERS_CREATE:
    "users.create",

  USERS_UPDATE_OWN:
    "users.update.own",

  USERS_UPDATE_ANY:
    "users.update.any",

  USERS_ROLE_CHANGE:
    "users.role.change",

  USERS_DELETE:
    "users.delete",


  /*
  |--------------------------------------------------------------------------
  | Comments
  |--------------------------------------------------------------------------
  */

  COMMENTS_READ:
    "comments.read",

  COMMENTS_CREATE:
    "comments.create",

  COMMENTS_MODERATE:
    "comments.moderate",


  /*
  |--------------------------------------------------------------------------
  | Categories
  |--------------------------------------------------------------------------
  */

  CATEGORIES_READ:
    "categories.read",

  CATEGORIES_MANAGE:
    "categories.manage",


  /*
  |--------------------------------------------------------------------------
  | Tags
  |--------------------------------------------------------------------------
  */

  TAGS_READ:
    "tags.read",

  TAGS_MANAGE:
    "tags.manage",


  /*
  |--------------------------------------------------------------------------
  | Media
  |--------------------------------------------------------------------------
  */

  MEDIA_READ:
    "media.read",

  MEDIA_MANAGE:
    "media.manage",


  /*
  |--------------------------------------------------------------------------
  | Advertisements
  |--------------------------------------------------------------------------
  */

  ADS_READ:
    "ads.read",

  ADS_MANAGE:
    "ads.manage",


  /*
  |--------------------------------------------------------------------------
  | Polls
  |--------------------------------------------------------------------------
  */

  POLLS_READ:
    "polls.read",

  POLLS_MANAGE:
    "polls.manage",


  /*
  |--------------------------------------------------------------------------
  | Analytics
  |--------------------------------------------------------------------------
  */

  ANALYTICS_VIEW:
    "analytics.view",


  /*
  |--------------------------------------------------------------------------
  | Roles / Permissions
  |--------------------------------------------------------------------------
  */

  ROLES_READ:
    "roles.read",

  ROLES_MANAGE:
    "roles.manage",

  PERMISSIONS_READ:
    "permissions.read",

  PERMISSIONS_MANAGE:
    "permissions.manage",


  /*
  |--------------------------------------------------------------------------
  | System
  |--------------------------------------------------------------------------
  */

  SETTINGS_READ:
    "settings.read",

  SETTINGS_MANAGE:
    "settings.manage",

  AUDIT_READ:
    "audit.read",

  SECURITY_READ:
    "security.read",

  SECURITY_MANAGE:
    "security.manage",


  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  STAFF_PROFILE:
    "staff.profile",


  /*
  |--------------------------------------------------------------------------
  | User Features
  |--------------------------------------------------------------------------
  */

  BOOKMARKS_MANAGE:
    "bookmarks.manage",

  LIKES_MANAGE:
    "likes.manage",

});


/*
|--------------------------------------------------------------------------
| SUPER ADMIN PERMISSIONS
|--------------------------------------------------------------------------
|
| Super Admin has every permission.
|
|--------------------------------------------------------------------------
*/

const SUPER_ADMIN_PERMISSIONS = Object.freeze([
  ...Object.values(PERMISSIONS),
]);


/*
|--------------------------------------------------------------------------
| ADMINISTRATOR PERMISSIONS
|--------------------------------------------------------------------------
|
| Administrator manages normal newsroom operations.
|
| IMPORTANT:
|
| Administrator CAN:
|
| - manage users
| - create Authors
| - create Editors
| - change normal staff roles
| - manage newsroom content
|
| Administrator CANNOT:
|
| - create Super Administrators
| - create Administrators
| - manage roles/permissions
| - manage system security
|
|--------------------------------------------------------------------------
*/

const ADMIN_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_VIEW,

  /*
  |--------------------------------------------------------------------------
  | News
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.NEWS_READ,
  PERMISSIONS.NEWS_CREATE,
  PERMISSIONS.NEWS_EDIT_OWN,
  PERMISSIONS.NEWS_EDIT_ANY,
  PERMISSIONS.NEWS_DELETE_OWN,
  PERMISSIONS.NEWS_DELETE_ANY,
  PERMISSIONS.NEWS_SUBMIT,
  PERMISSIONS.NEWS_REVIEW,
  PERMISSIONS.NEWS_APPROVE,
  PERMISSIONS.NEWS_PUBLISH,
  PERMISSIONS.NEWS_SCHEDULE,
  PERMISSIONS.NEWS_REJECT,
  PERMISSIONS.NEWS_FORWARD_SUPERADMIN,


  /*
  |--------------------------------------------------------------------------
  | Users
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_CREATE,
  PERMISSIONS.USERS_UPDATE_OWN,
  PERMISSIONS.USERS_UPDATE_ANY,
  PERMISSIONS.USERS_ROLE_CHANGE,
  PERMISSIONS.USERS_DELETE,


  /*
  |--------------------------------------------------------------------------
  | Comments
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.COMMENTS_READ,
  PERMISSIONS.COMMENTS_MODERATE,


  /*
  |--------------------------------------------------------------------------
  | Categories
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.CATEGORIES_READ,
  PERMISSIONS.CATEGORIES_MANAGE,


  /*
  |--------------------------------------------------------------------------
  | Tags
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.TAGS_READ,
  PERMISSIONS.TAGS_MANAGE,


  /*
  |--------------------------------------------------------------------------
  | Media
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.MEDIA_READ,
  PERMISSIONS.MEDIA_MANAGE,


  /*
  |--------------------------------------------------------------------------
  | Advertisements
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.ADS_READ,
  PERMISSIONS.ADS_MANAGE,


  /*
  |--------------------------------------------------------------------------
  | Polls
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.POLLS_READ,
  PERMISSIONS.POLLS_MANAGE,


  /*
  |--------------------------------------------------------------------------
  | Analytics
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.ANALYTICS_VIEW,


  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.STAFF_PROFILE,
];


/*
|--------------------------------------------------------------------------
| EDITOR PERMISSIONS
|--------------------------------------------------------------------------
|
| Editor:
|
| - has a separate Editor dashboard
| - reviews submitted stories
| - approves/rejects stories
| - schedules stories
| - manages editorial workflow
|
| Editor DOES NOT manage users or system administration.
|
|--------------------------------------------------------------------------
*/

const EDITOR_PERMISSIONS = [

  PERMISSIONS.DASHBOARD_VIEW,

  /*
  |--------------------------------------------------------------------------
  | News
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.NEWS_READ,
  PERMISSIONS.NEWS_CREATE,
  PERMISSIONS.NEWS_EDIT_OWN,
  PERMISSIONS.NEWS_DELETE_OWN,
  PERMISSIONS.NEWS_SUBMIT,

  PERMISSIONS.NEWS_REVIEW,
  PERMISSIONS.NEWS_APPROVE,

  PERMISSIONS.NEWS_SCHEDULE,
  PERMISSIONS.NEWS_REJECT,


  /*
  |--------------------------------------------------------------------------
  | Comments
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.COMMENTS_READ,
  PERMISSIONS.COMMENTS_MODERATE,


  /*
  |--------------------------------------------------------------------------
  | Taxonomy
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.CATEGORIES_READ,
  PERMISSIONS.TAGS_READ,


  /*
  |--------------------------------------------------------------------------
  | Analytics
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.ANALYTICS_VIEW,


  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.STAFF_PROFILE,
];


/*
|--------------------------------------------------------------------------
| AUTHOR PERMISSIONS
|--------------------------------------------------------------------------
|
| Author:
|
| - has a separate Author dashboard
| - creates stories
| - edits own stories
| - submits stories
| - views own editorial progress
|
| Author DOES NOT:
|
| - review other authors
| - approve stories
| - publish directly
| - manage users
|
|--------------------------------------------------------------------------
*/

const AUTHOR_PERMISSIONS = [

  PERMISSIONS.DASHBOARD_VIEW,

  /*
  |--------------------------------------------------------------------------
  | News
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.NEWS_READ,
  PERMISSIONS.NEWS_CREATE,
  PERMISSIONS.NEWS_EDIT_OWN,
  PERMISSIONS.NEWS_DELETE_OWN,
  PERMISSIONS.NEWS_SUBMIT,


  /*
  |--------------------------------------------------------------------------
  | Comments
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.COMMENTS_READ,


  /*
  |--------------------------------------------------------------------------
  | Taxonomy
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.CATEGORIES_READ,
  PERMISSIONS.TAGS_READ,


  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  PERMISSIONS.STAFF_PROFILE,
];


/*
|--------------------------------------------------------------------------
| REGISTERED USER PERMISSIONS
|--------------------------------------------------------------------------
*/

const USER_PERMISSIONS = [

  PERMISSIONS.NEWS_READ,

  PERMISSIONS.COMMENTS_READ,
  PERMISSIONS.COMMENTS_CREATE,

  PERMISSIONS.BOOKMARKS_MANAGE,
  PERMISSIONS.LIKES_MANAGE,

];


/*
|--------------------------------------------------------------------------
| ROLE → PERMISSIONS
|--------------------------------------------------------------------------
*/

export const ROLE_PERMISSIONS = Object.freeze({

  [ROLES.SUPER_ADMIN]:
    SUPER_ADMIN_PERMISSIONS,

  [ROLES.ADMIN]:
    ADMIN_PERMISSIONS,

  [ROLES.EDITOR]:
    EDITOR_PERMISSIONS,

  [ROLES.AUTHOR]:
    AUTHOR_PERMISSIONS,

  [ROLES.USER]:
    USER_PERMISSIONS,

});


/*
|--------------------------------------------------------------------------
| ROLE GROUPS
|--------------------------------------------------------------------------
*/

export const STAFF_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.AUTHOR,
]);


export const ADMIN_ROLES = Object.freeze([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
]);


export const ALL_STAFF_ROLES = Object.freeze([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.AUTHOR,
]);


/*
|--------------------------------------------------------------------------
| ADMIN-MANAGED STAFF ROLES
|--------------------------------------------------------------------------
|
| These are the ONLY roles an Administrator may create/assign.
|
|--------------------------------------------------------------------------
*/

export const ADMIN_MANAGED_ROLES = Object.freeze([
  ROLES.EDITOR,
  ROLES.AUTHOR,
]);


/*
|--------------------------------------------------------------------------
| NORMALIZE ROLE
|--------------------------------------------------------------------------
*/

export function normalizeRole(role) {

  if (!role) {
    return ROLES.USER;
  }

  const value =
    String(role)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_")
      .replace(/\/+/g, "_");


  switch (value) {

    /*
    |--------------------------------------------------------------------------
    | Super Admin
    |--------------------------------------------------------------------------
    */

    case "SUPER_ADMIN":
    case "SUPERADMIN":
    case "SUPER_ADMINISTRATOR":
    case "SUPER_ADMINISTRATOR_ROLE":
    case "SUPER_ADMINISTRATOR_ACCOUNT":

      return ROLES.SUPER_ADMIN;


    /*
    |--------------------------------------------------------------------------
    | Administrator
    |--------------------------------------------------------------------------
    */

    case "ADMIN":
    case "ADMINISTRATOR":
    case "ADMINISTRATOR_ROLE":

      return ROLES.ADMIN;


    /*
    |--------------------------------------------------------------------------
    | Editor
    |--------------------------------------------------------------------------
    */

    case "EDITOR":
    case "EDITOR_ROLE":

      return ROLES.EDITOR;


    /*
    |--------------------------------------------------------------------------
    | Author
    |--------------------------------------------------------------------------
    */

    case "AUTHOR":
    case "REPORTER":
    case "AUTHOR_REPORTER":
    case "AUTHOR__REPORTER":

      return ROLES.AUTHOR;


    /*
    |--------------------------------------------------------------------------
    | Registered User
    |--------------------------------------------------------------------------
    */

    case "REGISTERED_USER":
    case "REGISTERED":
    case "USER":
    case "REGISTEREDUSER":

      return ROLES.USER;


    default:

      return ROLES.USER;
  }
}


/*
|--------------------------------------------------------------------------
| ROLE CHECKS
|--------------------------------------------------------------------------
*/

export function isStaffRole(role) {

  const normalized =
    normalizeRole(role);

  return (
    normalized === ROLES.SUPER_ADMIN ||
    STAFF_ROLES.includes(normalized)
  );
}


export function isAdminRole(role) {

  const normalized =
    normalizeRole(role);

  return ADMIN_ROLES.includes(
    normalized
  );
}


export function isSuperAdminRole(role) {

  return (
    normalizeRole(role) ===
    ROLES.SUPER_ADMIN
  );
}


export function isEditorRole(role) {

  return (
    normalizeRole(role) ===
    ROLES.EDITOR
  );
}


export function isAuthorRole(role) {

  return (
    normalizeRole(role) ===
    ROLES.AUTHOR
  );
}


export function isRegisteredUserRole(role) {

  return (
    normalizeRole(role) ===
    ROLES.USER
  );
}


/*
|--------------------------------------------------------------------------
| PERMISSION CHECK
|--------------------------------------------------------------------------
*/

export function hasPermission(
  role,
  permission
) {

  const normalized =
    normalizeRole(role);

  if (!permission) {
    return false;
  }

  const permissions =
    ROLE_PERMISSIONS[
      normalized
    ] || [];


  return permissions.includes(
    permission
  );
}


/*
|--------------------------------------------------------------------------
| ANY PERMISSION
|--------------------------------------------------------------------------
*/

export function hasAnyPermission(
  role,
  permissions = []
) {

  if (!Array.isArray(permissions)) {
    return false;
  }

  return permissions.some(
    (permission) =>
      hasPermission(
        role,
        permission
      )
  );
}


/*
|--------------------------------------------------------------------------
| ALL PERMISSIONS
|--------------------------------------------------------------------------
*/

export function hasAllPermissions(
  role,
  permissions = []
) {

  if (!Array.isArray(permissions)) {
    return false;
  }

  return permissions.every(
    (permission) =>
      hasPermission(
        role,
        permission
      )
  );
}


/*
|--------------------------------------------------------------------------
| ROLE MATCH
|--------------------------------------------------------------------------
*/

export function hasRole(
  role,
  roles = []
) {

  if (!Array.isArray(roles)) {
    return false;
  }

  const normalized =
    normalizeRole(role);

  return roles.some(
    (candidate) =>
      normalizeRole(candidate) ===
      normalized
  );
}


/*
|--------------------------------------------------------------------------
| ROLE LABEL
|--------------------------------------------------------------------------
*/

export function getRoleLabel(role) {

  switch (
    normalizeRole(role)
  ) {

    case ROLES.SUPER_ADMIN:
      return "Super Administrator";

    case ROLES.ADMIN:
      return "Administrator";

    case ROLES.EDITOR:
      return "Editor";

    case ROLES.AUTHOR:
      return "Author / Reporter";

    case ROLES.USER:
    default:
      return "Registered User";
  }
}


/*
|--------------------------------------------------------------------------
| DASHBOARD PATH
|--------------------------------------------------------------------------
*/

export function getDashboardPath(role) {

  const normalized =
    normalizeRole(role);


  if (
    normalized ===
    ROLES.SUPER_ADMIN
  ) {
    return "/super-admin/dashboard";
  }


  if (
    normalized ===
    ROLES.ADMIN
  ) {
    return "/admin/dashboard";
  }


  if (
    normalized ===
    ROLES.EDITOR
  ) {
    return "/editor/dashboard";
  }


  if (
    normalized ===
    ROLES.AUTHOR
  ) {
    return "/author/dashboard";
  }


  return "/";
}


/*
|--------------------------------------------------------------------------
| PERMISSION CATALOG
|--------------------------------------------------------------------------
*/

export const PERMISSION_CATALOG =
  Object.freeze(
    Object.entries(
      PERMISSIONS
    ).map(
      ([key, id]) => ({
        key,
        id,
      })
    )
  );


/*
|--------------------------------------------------------------------------
| RBAC HELPERS
|--------------------------------------------------------------------------
*/

export function getRolePermissions(
  role
) {

  const normalized =
    normalizeRole(role);

  return [
    ...(
      ROLE_PERMISSIONS[
        normalized
      ] || []
    ),
  ];
}


export function getAllRoles() {

  return [
    ...ALL_STAFF_ROLES,
    ROLES.USER,
  ];
}


export function getAllPermissions() {

  return [
    ...Object.values(
      PERMISSIONS
    ),
  ];
}


/*
|--------------------------------------------------------------------------
| ADMIN ROLE SAFETY
|--------------------------------------------------------------------------
|
| Used by AdminUsersPage.
|
| Even if a UI accidentally passes ADMIN or SUPER_ADMIN,
| this helper prevents Administrator from assigning those roles.
|
|--------------------------------------------------------------------------
*/

export function canAdminManageRole(
  targetRole
) {

  const normalized =
    normalizeRole(targetRole);

  return ADMIN_MANAGED_ROLES.includes(
    normalized
  );
}