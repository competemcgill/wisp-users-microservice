import { authConfig, basePaths } from "../config/auth";

export const auth = {
    parseUri: (uri: string): { route: string; id: string } => {
        const routes: string[] = Object.keys(authConfig);
        uri = uri.split("?")[0];
        if (uri[uri.length - 1] == "/") uri = uri.substr(0, uri.length - 1);

        if (routes.includes(uri)) return { route: uri, id: "" };
        else {
            const uriSlice = uri.split("/");
            uriSlice.shift();
            const basePath = uriSlice[0];
            const id = uriSlice.length > 1 ? uriSlice[1] : "";

            if (!basePaths.includes(basePath)) return { route: "", id: "" };
            else {
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
                    return false;
                case "PUBLIC":
                    return true;
                case "ADMIN":
                    return role === "ADMIN";
                case "USER":
                    if (routeConfig.userProtected) {
                        if (
                            resourceUserId &&
                            requestUserId === resourceUserId &&
                            (role === "ADMIN" || role === "USER")
                        )
                            return true;
                        else return false;
                    }

                    return role === "ADMIN" || role === "USER";
                default:
                    return false;
            }
        }

        return false;
    }
};
