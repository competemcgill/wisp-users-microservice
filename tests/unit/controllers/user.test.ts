import sinon from "sinon";
import crypto from "crypto";
import { User, IUserModel } from "../../../src/database/models/user";
import { userController } from "../../../src/controllers/user";
import { userDBInteractionsStubs, userValidatorStubs, userUtilStubs } from "../stubs/user";
import { mockReq, mockRes } from "sinon-express-mock";
import { bcryptPassword } from "../../../src/config/bcrypt";
import { statusCodes } from "../../../src/config/statusCodes";

let stubs;
const testUser: IUserModel = new User({
    username: "test",
    password: bcryptPassword.generateHash("password"),
    email: "test@gmail.com",
    role: "USER",
    info: {
        major: "Computer Science",
        year: "U3",
        school: "McGill University",
        bio: "Test account",
        profilePhoto: "",
    },
    problems: [],
    problemSets: [],
    platformData: {
        codeforces: {
            username: "test",
            email: "test@gmail.com",
        },
    },
});

describe("Users controller tests", () => {
    before(() => {
        stubs = {
            userDB: userDBInteractionsStubs(),
            userValidator: userValidatorStubs(),
            userUtil: userUtilStubs()
        };
    });

    beforeEach(() => {
        mockRes.status = sinon.stub().returns(mockRes);
        mockRes.json = sinon.stub().returns(mockRes);
    });

    afterEach(() => {
        sinon.reset();
    });

    after(() => {
        stubs.userDB.restore();
        stubs.userValidator.restore();
        stubs.userUtil.restore();
    });

    describe("Index", () => {

        it("status 200: returns a list of a single user", async () => {
            stubs.userDB.all.returns([testUser]);
            await userController.index(mockReq, mockRes);
            sinon.assert.calledOnce(stubs.userDB.all);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            sinon.assert.calledWith(mockRes.json, [testUser]);
        });

        it("status 200: returns a list of multiple users", async () => {
            stubs.userDB.all.returns([testUser, testUser]);
            await userController.index(mockReq, mockRes);
            sinon.assert.calledOnce(stubs.userDB.all);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            sinon.assert.calledWith(mockRes.json, [testUser, testUser]);
        });

        it("status 500: returns server error if server fails", async () => {
            stubs.userDB.all.throws();
            await userController.index(mockReq, mockRes);
            sinon.assert.calledOnce(stubs.userDB.all);
            sinon.assert.calledWith(mockRes.status, statusCodes.SERVER_ERROR);
        });
    });

    describe("Show", () => {

        let req;
        beforeEach(() => {
            req = mockReq({
                params: {
                    userId: testUser._id
                }
            });
        });

        it("status 200: returns user with given id", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.returns(testUser);
            stubs.userUtil.codeforces.updateUserProblems.returns();
            await userController.show(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.find);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledOnce(stubs.userUtil.codeforces.updateUserProblems);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            sinon.assert.calledWith(mockRes.json, testUser);
        });

        it("status 404: returns an appropriate response if user with given id doesn't exist", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.returns(null);
            await userController.show(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.find);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.NOT_FOUND);
            sinon.assert.calledWith(mockRes.json, { status: statusCodes.NOT_FOUND, message: "User not found" });
        });

        it("status 422: returns an appropriate response with validation error", async () => {
            const errorMsg = { status: statusCodes.MISSING_PARAMS, message: "params[userId]: Invalid or missing ':userId'" };
            req.params.userId = "not ObjectId";
            stubs.userValidator.validationResult.returns({
                isEmpty() { return false; },
                formatWith() {
                    return {
                        array() {
                            return [errorMsg];
                        }
                    };
                },
            });
            await userController.show(req, mockRes);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.MISSING_PARAMS);
            sinon.assert.calledWith(mockRes.json, errorMsg);
        });

        it("status 500: returns an appropriate response if server fails", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.throws();
            await userController.show(mockReq, mockRes);
            sinon.assert.calledWith(mockRes.status, statusCodes.SERVER_ERROR);
        });
    });

    describe("Create", () => {

        let req;
        beforeEach(() => {
            req = mockReq({
                body: {
                    ...testUser,
                    password: "password",
                    info: { ...testUser.info },
                    platformData: {
                        ...testUser.platformData,
                        codeforces: { ...testUser.platformData.codeforces }
                    }
                }
            });
        });

        it("status 200: returns new user", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.findByEmail.returns(null);
            stubs.userDB.create.returns(testUser);
            await userController.create(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.findByEmail);
            sinon.assert.calledOnce(stubs.userDB.create);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            const tmp = testUser.toJSON();
            delete tmp.password;
            sinon.assert.calledWith(mockRes.json, tmp);
        });

        it("status 400: returns an appropriate response if user already exists", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.findByEmail.returns(testUser);
            await userController.create(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.findByEmail);
            sinon.assert.calledWith(mockRes.status, statusCodes.BAD_REQUEST);
            sinon.assert.calledWith(mockRes.json, { status: statusCodes.BAD_REQUEST, message: "User already exists" });
        });

        it("status 422: returns an appropriate response with validation errors", async () => {
            const errorMsg = { status: statusCodes.MISSING_PARAMS, message: "body[email]: Invalid or missing 'email'" };
            req.body.email = "not an email";
            stubs.userValidator.validationResult.returns({
                isEmpty() { return false; },
                formatWith() {
                    return {
                        array() {
                            return [errorMsg];
                        }
                    };
                },
            });
            await userController.create(req, mockRes);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.MISSING_PARAMS);
            sinon.assert.calledWith(mockRes.json, errorMsg);
        });

        it("status 500: returns an appropriate response if server fails", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.findByEmail.returns(null);
            stubs.userDB.create.throws();
            await userController.create(req, mockRes);
            sinon.assert.calledWith(mockRes.status, statusCodes.SERVER_ERROR);
        });
    });

    describe("Update", () => {

        let req;
        beforeEach(() => {
            req = mockReq({
                body: {
                    ...testUser,
                    password: "password",
                    info: { ...testUser.info },
                    platformData: {
                        ...testUser.platformData,
                        codeforces: { ...testUser.platformData.codeforces }
                    }
                },
                params: {
                    userId: testUser._id
                }
            });
        });

        it("status 200: returns updated user", async () => {
            const updatedUser = JSON.parse(JSON.stringify(testUser));
            updatedUser.username = "update test";
            req.body.username = "update test";
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.returns(testUser);
            stubs.userDB.update.returns(updatedUser);
            await userController.update(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.find);
            sinon.assert.calledOnce(stubs.userDB.update);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            sinon.assert.calledWith(mockRes.json, updatedUser);
        });

        it("status 404: returns an appropriate response if user doesn't exist", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.returns(null);
            await userController.update(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.find);
            sinon.assert.calledWith(mockRes.status, statusCodes.NOT_FOUND);
            sinon.assert.calledWith(mockRes.json, { status: statusCodes.NOT_FOUND, message: "User not found" });
        });

        it("status 422: returns an appropriate response with validation errors", async () => {
            const errorMsg = { status: statusCodes.MISSING_PARAMS, message: "body[email]: Invalid 'email'" };
            req.body.email = "not an email";
            stubs.userValidator.validationResult.returns({
                isEmpty() { return false; },
                formatWith() {
                    return {
                        array() {
                            return [errorMsg];
                        }
                    };
                },
            });
            await userController.update(req, mockRes);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.MISSING_PARAMS);
            sinon.assert.calledWith(mockRes.json, errorMsg);
        });

        it("status 500: returns an appropriate response if server fails", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.returns(testUser);
            stubs.userDB.update.throws();
            await userController.update(req, mockRes);
            sinon.assert.calledWith(mockRes.status, statusCodes.SERVER_ERROR);
        });
    });

    describe("Delete", () => {

        let req;
        beforeEach(() => {
            req = mockReq({
                params: {
                    userId: testUser._id
                }
            });
        });

        it("status 200: returns empty response after user deletion", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.returns(testUser);
            stubs.userDB.delete.returns(testUser);
            await userController.delete(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.find);
            sinon.assert.calledOnce(stubs.userDB.delete);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            sinon.assert.calledWith(mockRes.json);
        });

        it("status 404: returns an appropriate response if user doesn't exist", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.returns(null);
            await userController.delete(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.find);
            sinon.assert.calledWith(mockRes.status, statusCodes.NOT_FOUND);
            sinon.assert.calledWith(mockRes.json, { status: statusCodes.NOT_FOUND, message: "User not found" });
        });

        it("status 422: returns an appropriate response with validation errors", async () => {
            const errorMsg = { status: statusCodes.MISSING_PARAMS, message: "params[email]: Invalid or missing ':userId'" };
            req.params.userId = "not an ObjectId";
            stubs.userValidator.validationResult.returns({
                isEmpty() { return false; },
                formatWith() {
                    return {
                        array() {
                            return [errorMsg];
                        }
                    };
                },
            });
            await userController.delete(req, mockRes);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.MISSING_PARAMS);
            sinon.assert.calledWith(mockRes.json, errorMsg);
        });

        it("status 500: returns an appropriate response if server fails", async () => {
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.returns(testUser);
            stubs.userDB.delete.throws();
            await userController.delete(req, mockRes);
            sinon.assert.calledWith(mockRes.status, statusCodes.SERVER_ERROR);
        });
    });
});