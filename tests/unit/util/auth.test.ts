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

        it("Regects all access to internal routes", () => {
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

        it("Regects all access by default", () => {
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
        it("Returns true", () => {
            // TODO
        });
    });
});
