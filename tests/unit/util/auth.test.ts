import { expect } from "chai";
import { auth } from "../../../src/util/auth";

const roles = ["USER", "ADMIN", ""];
const userId1 = "507f1f77bcf86cd799439011";
const userId2 = "507f191e810c19729de860ea";

describe("Auth util", () => {
    describe("Authorize", () => {
        it("Allows all access to PUBLIC routes", () => {
            for (const role of roles) {
                const isAuthorized = auth.authorize(
                    "/users",
                    "post",
                    role,
                    userId1,
                    userId1
                );

                expect(isAuthorized).to.be.true;
            }
        });

        it("Allows admins to access ADMIN routes", () => {
            const isAuthorized = auth.authorize(
                "/problems",
                "post",
                "ADMIN",
                userId1,
                userId1
            );

            expect(isAuthorized).to.be.true;
        });

        it("Allows admins to access USER routes", () => {
            const isAuthorized = auth.authorize(
                "/users",
                "get",
                "ADMIN",
                userId1,
                userId1
            );

            expect(isAuthorized).to.be.true;
        });

        it("Allows users to access USER routes", () => {
            const isAuthorized = auth.authorize(
                "/users",
                "get",
                "USER",
                userId1,
                userId1
            );

            expect(isAuthorized).to.be.true;
        });

        it("Allows user access to their own user-protected resources", () => {
            const isAuthorized = auth.authorize(
                "/users/{id}",
                "put",
                "USER",
                userId1,
                userId1
            );

            expect(isAuthorized).to.be.true;
        });

        it("Rejects user access to ADMIN routes", () => {
            const isAuthorized = auth.authorize(
                "/problems",
                "post",
                "USER",
                userId1,
                userId1
            );

            expect(isAuthorized).to.be.false;
        });

        it("Rejects user access to other other users' protected resources", () => {
            const isAuthorized = auth.authorize(
                "/users/{id}",
                "put",
                "USER",
                userId1,
                userId2
            );

            expect(isAuthorized).to.be.false;
        });

        it("Rejects all access to internal routes", () => {
            for (const role of roles) {
                const isAuthorized = auth.authorize(
                    "/users/resetlastsubmissions",
                    "patch",
                    role,
                    userId1,
                    userId1
                );

                expect(isAuthorized).to.be.false;
            }
        });

        it("Rejects all access by default", () => {
            for (const role of roles) {
                const isAuthorized = auth.authorize(
                    "/test",
                    "patch",
                    role,
                    userId1,
                    userId1
                );

                expect(isAuthorized).to.be.false;
            }
        });
    });

    describe("ParseUri", () => {
        it("Correctly parses uri with a valid basepath and without route or query params", () => {
            const routes = ["/users", "/problems", "/auth", "/problemSets"];

            for (const r of routes) {
                const { route, resourceUserId } = auth.parseUri(r);

                expect(route).to.equal(r.toLowerCase());
                expect(resourceUserId).to.equal("");
            }
        });

        it("Correctly parses uri with a valid basepath and route params", () => {
            const { route, resourceUserId } = auth.parseUri(
                `/users/${userId1}`
            );

            expect(route).to.equal("/users/{id}");
            expect(resourceUserId).to.equal(userId1);
        });

        it("Correctly parses uri with a valid basepath and query params", () => {
            const { route, resourceUserId } = auth.parseUri(
                "/users?key1=value1&key2=value2"
            );

            expect(route).to.equal("/users");
            expect(resourceUserId).to.equal("");
        });

        it("Correctly parses uri with a valid basepath, route params, and query params", () => {
            const { route, resourceUserId } = auth.parseUri(
                `/users/${userId1}?key1=value1&key2=value2`
            );

            expect(route).to.equal("/users/{id}");
            expect(resourceUserId).to.equal(userId1);
        });

        it("Correctly parses the same route with different case", () => {
            const routes = [
                "/users/resetLastSubmissions",
                "/users/resetlastsubmissions",
                "/UsErs/ResetLAsTsuBmissIOns"
            ];

            for (const r of routes) {
                const { route, resourceUserId } = auth.parseUri(r);

                expect(route).to.equal("/users/resetlastsubmissions");
                expect(resourceUserId).to.equal("");
            }
        });

        it("Returns an empty route when parsing a uri with invalid basepath", () => {
            const routes = [
                "/test",
                "/test/ajkshdkajshdjsad",
                "/test?key=value",
                "/test/ajkshdkajshdjsad?key=value"
            ];

            for (const r of routes) {
                const { route, resourceUserId } = auth.parseUri(r);

                expect(route).to.equal("");
                expect(resourceUserId).to.equal("");
            }
        });
    });
});
