import { authConfig, basePaths } from "../config/auth";

export const auth = {
    parseUri: (uri: string): { route: string; id: string } => {
        // load list of routes
        const routes: string[] = Object.keys(authConfig);
        // remove query params
        uri = uri.split("?")[0];
        // remove extra "/" at the end if it's there
        if (uri[uri.length - 1] == "/") uri = uri.substr(0, uri.length - 1);

        // check if there is a route matching the uri
        // (saves time if the route doesn't have route params)
        if (routes.includes(uri.toLowerCase()))
            return { route: uri.toLowerCase(), id: "" };
        else {
            // split uri and remove 1st empty position
            const uriSlice = uri.split("/");
            uriSlice.shift();
            // extract id (can be any resource id but only user
            // ids will be used in case of a user-protected route)
            const id = uriSlice.length > 1 ? uriSlice[1] : "";

            // lowercase all array elements
            for (let i = 0; i < uriSlice.length; i++)
                uriSlice[i] = uriSlice[i].toLowerCase();

            // get base path
            const basePath = uriSlice[0];

            // if basepath doesn't exist, then route doesn't exist
            if (!basePaths.includes(basePath)) return { route: "", id: "" };
            else {
                // remove the id variable to something consistent
                if (id) uriSlice[1] = "{id}";
                return {
                    route: "/" + uriSlice.join("/"),
                    id: id ? id : ""
                };
            }
        }
    },

    authorize: (
        route: string,
        method: string,
        role: string,
        requestUserId: string,
        resourceUserId: string
    ): boolean => {
        if (authConfig[route] && authConfig[route][method]) {
            const routeConfig = authConfig[route][method];

            switch (routeConfig.scope) {
                case "INTERNAL":
                    // reject right away since internal requests won't pass by the
                    // introspection route
                    return false;
                case "PUBLIC":
                    // accept right away since public requests won't pass by the
                    // introspection route
                    return true;
                case "ADMIN":
                    // check if role is admin
                    return role === "ADMIN";
                case "USER":
                    // check if role is user or higher
                    const authorizedInUserScope =
                        role === "ADMIN" || role === "USER";

                    if (routeConfig.userProtected) {
                        // verify that the correct user is modifying the resource
                        if (
                            resourceUserId &&
                            requestUserId === resourceUserId &&
                            authorizedInUserScope
                        )
                            return true;
                        else return false;
                    }

                    return authorizedInUserScope;
                default:
                    return false;
            }
        }

        // default to rejection
        // i.e. all unregistered routes are internal by default
        return false;
    }
};
