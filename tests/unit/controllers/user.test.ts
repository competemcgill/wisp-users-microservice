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

    describe("USERS: index", () => {

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

    describe("USERS: show", () => {

        let req;
        beforeEach(() => {
            req = mockReq({
                params: {
                    userId: "507f1f77bcf86cd799439011"
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

    describe("USERS: create", () => {

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

    describe("USERS: update", () => { });

    describe("USERS: delete", () => { });
});