/**
 * NOTES:
 * - Possible scopes: INTERNAL, PUBLIC, ADMIN, and USER
 * - Base paths and routes should be all LOWERCASE
 * - We only support routes of the following formats for the time being:
 *      - /resource
 *      - /resource/{id}
 *      - /resource/{id}/action
 */
export const basePaths = ["users", "auth", "problems", "problemsets"];

export const authConfig = {
    "/users": {
        get: {
            scope: "USER",
            userProtected: false
        },
        post: {
            scope: "PUBLIC",
            userProtected: false
        }
    },
    "/users/{id}": {
        get: {
            scope: "USER",
            userProtected: false
        },
        put: {
            scope: "USER",
            userProtected: true
        },
        delete: {
            scope: "USER",
            userProtected: true
        }
    },
    "/users/resetlastsubmissions": {
        patch: {
            scope: "INTERNAL",
            userProtected: false
        }
    },
    "/users/{id}/problems": {
        patch: {
            scope: "USER",
            userProtected: true
        }
    },
    "/users/{id}/problemsets": {
        patch: {
            scope: "USER",
            userProtected: true
        }
    },
    "/auth/introspect": {
        post: {
            scope: "INTERNAL",
            userProtected: false
        }
    },
    "/auth/login": {
        post: {
            scope: "PUBLIC",
            userProtected: false
        }
    },
    "/problems": {
        get: {
            scope: "USER",
            userProtected: false
        },
        post: {
            scope: "ADMIN",
            userProtected: false
        }
    },
    "/problems/{id}": {
        get: {
            scope: "USER",
            userProtected: false
        },
        put: {
            scope: "ADMIN",
            userProtected: false
        },
        delete: {
            scope: "ADMIN",
            userProtected: false
        }
    },
    "/problems/{id}/exists": {
        get: {
            scope: "INTERNAL",
            userProtected: false
        }
    },
    "/problemsets": {
        get: {
            scope: "USER",
            userProtected: false
        },
        post: {
            scope: "ADMIN",
            userProtected: false
        }
    },
    "/problemsets/{id}": {
        get: {
            scope: "USER",
            userProtected: false
        },
        put: {
            scope: "ADMIN",
            userProtected: false
        },
        delete: {
            scope: "ADMIN",
            userProtected: false
        }
    }
};
