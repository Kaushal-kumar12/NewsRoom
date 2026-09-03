// src/services/rbac/permissionService.js

import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  normalizeRole,
  hasPermission,
} from "../../config/rolePermissions";


/*
|--------------------------------------------------------------------------
| Permission catalog
|--------------------------------------------------------------------------
|
| This is only the human-readable catalog.
|
| Permission assignment remains controlled by:
|
| src/config/rolePermissions.js
|
|--------------------------------------------------------------------------
*/

export const permissionCatalog = [

  {
    group: "Dashboard",

    permissions: [
      [
        PERMISSIONS.DASHBOARD_VIEW,
        "View dashboard",
      ],
    ],
  },


  {
    group: "News",

    permissions: [

      [
        PERMISSIONS.NEWS_READ,
        "View newsroom content",
      ],

      [
        PERMISSIONS.NEWS_CREATE,
        "Create stories",
      ],

      [
        PERMISSIONS.NEWS_EDIT_OWN,
        "Edit own stories",
      ],

      [
        PERMISSIONS.NEWS_EDIT_ANY,
        "Edit any story",
      ],

      [
        PERMISSIONS.NEWS_DELETE_OWN,
        "Delete own stories",
      ],

      [
        PERMISSIONS.NEWS_DELETE_ANY,
        "Delete any story",
      ],

      [
        PERMISSIONS.NEWS_SUBMIT,
        "Submit stories for review",
      ],

      [
        PERMISSIONS.NEWS_REVIEW,
        "Review submitted stories",
      ],

      [
        PERMISSIONS.NEWS_APPROVE,
        "Approve stories",
      ],

      [
        PERMISSIONS.NEWS_PUBLISH,
        "Publish stories",
      ],

      [
        PERMISSIONS.NEWS_FORWARD_SUPERADMIN,
        "Forward stories to Super Admin",
      ],
    ],
  },


  {
    group: "Users",

    permissions: [

      [
        PERMISSIONS.USERS_READ,
        "View users",
      ],

      [
        PERMISSIONS.USERS_UPDATE_OWN,
        "Update own profile",
      ],

      [
        PERMISSIONS.USERS_UPDATE_ANY,
        "Update any user",
      ],

      [
        PERMISSIONS.USERS_ROLE_CHANGE,
        "Change user roles",
      ],

      [
        PERMISSIONS.USERS_DELETE,
        "Delete users",
      ],
    ],
  },


  {
    group: "Comments",

    permissions: [

      [
        PERMISSIONS.COMMENTS_READ,
        "View comments",
      ],

      [
        PERMISSIONS.COMMENTS_MODERATE,
        "Moderate comments",
      ],
    ],
  },


  {
    group: "Categories",

    permissions: [

      [
        PERMISSIONS.CATEGORIES_READ,
        "View categories",
      ],

      [
        PERMISSIONS.CATEGORIES_MANAGE,
        "Manage categories",
      ],
    ],
  },


  {
    group: "Tags",

    permissions: [

      [
        PERMISSIONS.TAGS_READ,
        "View tags",
      ],

      [
        PERMISSIONS.TAGS_MANAGE,
        "Manage tags",
      ],
    ],
  },


  {
    group: "Advertisements",

    permissions: [

      [
        PERMISSIONS.ADS_READ,
        "View advertisements",
      ],

      [
        PERMISSIONS.ADS_MANAGE,
        "Manage advertisements",
      ],
    ],
  },


  {
    group: "Analytics",

    permissions: [

      [
        PERMISSIONS.ANALYTICS_VIEW,
        "View analytics",
      ],
    ],
  },


  {
    group: "Profile",

    permissions: [

      [
        PERMISSIONS.STAFF_PROFILE,
        "Manage staff profile",
      ],
    ],
  },
];


export const allPermissions =
  permissionCatalog.flatMap(
    (group) =>
      group.permissions.map(
        ([id, label]) => ({
          id,
          label,
          group:
            group.group,
        })
      )
  );


/*
|--------------------------------------------------------------------------
| Canonical exports
|--------------------------------------------------------------------------
*/

export {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  normalizeRole,
  hasPermission,
};