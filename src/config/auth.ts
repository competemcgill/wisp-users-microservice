export const basePaths = ["users", "auth"];

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
    "/users/resetLastSubmissions": {
        patch: {
            scope: "ADMIN",
            userProtected: false
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
    }
};
