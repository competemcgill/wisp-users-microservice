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
            lastSubmission: {
                problemId: crypto.createHash("sha1").update("testId").digest("hex"),
                isComplete: false,
                status: ""
            },
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

        it("status 200: returns user with given id", async () => {
            const req = mockReq({
                params: {
                    userId: "507f1f77bcf86cd799439011"
                }
            });
            stubs.userDB.find.returns(testUser);
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userUtil.codeforces.updateUserProblems.returns();
            await userController.show(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.find);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledOnce(stubs.userUtil.codeforces.updateUserProblems);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            sinon.assert.calledWith(mockRes.json, testUser);
        });

        it("status 404: returns an appropriate response if user with given id doesn't exist", async () => {
            const req = mockReq({
                params: {
                    userId: "507f1f77bcf86cd799439011"
                }
            });
            stubs.userDB.find.returns(null);
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            await userController.show(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.find);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.NOT_FOUND);
            sinon.assert.calledWith(mockRes.json, { status: statusCodes.NOT_FOUND, message: "User not found" });
        });

        it("status 422: returns an appropriate response if id isn't a mongo ObjectId", async () => {
            const errorMsg = { status: statusCodes.MISSING_PARAMS, message: "params[userId]: Invalid or missing ':userId'" };
            const req = mockReq({
                params: {
                    userId: "not ObjectId"
                }
            });
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
            const req = mockReq({
                params: {
                    userId: "507f1f77bcf86cd799439011"
                }
            });
            stubs.userValidator.validationResult.returns({ isEmpty() { return true; } });
            stubs.userDB.find.throws();
            await userController.show(mockReq, mockRes);
            sinon.assert.calledWith(mockRes.status, statusCodes.SERVER_ERROR);
        });
    });

    describe("USERS: create", () => { });

    describe("USERS: update", () => { });

    describe("USERS: delete", () => { });
});