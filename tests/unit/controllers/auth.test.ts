import * as jwt from "jsonwebtoken";
import sinon from "sinon";
import { User, IUserModel } from "../../../src/database/models/user";
import { authController } from "../../../src/controllers/auth";
import { userDBInteractionsStubs, userValidatorStubs, userUtilStubs } from "../stubs/user";
import { jwtStubs } from "../stubs/auth";
import { mockReq, mockRes } from "sinon-express-mock";
import { bcryptPassword } from "../../../src/config/bcrypt";
import { statusCodes } from "../../../src/config/statusCodes";
import {emptyValidationError, validationErrorWithMessage} from "../../utils/consts/validation";

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
const testToken = jwt.sign({ id: testUser._id, email: testUser.email, role: testUser.role }, process.env.SECRET);
const testTokenIat = Math.trunc(Date.now() / 1000);

describe("Auth controller tests", () => {
    before(() => {
        stubs = {
            userDB: userDBInteractionsStubs(),
            userValidator: userValidatorStubs(),
            userUtil: userUtilStubs(),
            jwt: jwtStubs()
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
        stubs.jwt.restore();
    });

    describe("Introspect", () => {

        let req;
        beforeEach(() => {
            req = mockReq({
                query: {
                    token: testToken
                }
            });
        });

        it("status 200: returns a token with it's user", async () => {
            stubs.userValidator.validationResult.returns(emptyValidationError());
            await authController.introspect(req, mockRes);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            sinon.assert.calledWith(mockRes.json, { active: true, user: { email: testUser.email, id: `${testUser._id}`, role: testUser.role, iat: testTokenIat } });
        });

        it("status 422: returns an appropriate response with validation errors", async () => {
            const errorMsg = { status: statusCodes.MISSING_PARAMS, message: "query[token]: Missing 'token'" };
            req.query.token = "not a token";
            stubs.userValidator.validationResult.returns(validationErrorWithMessage(errorMsg));
            await authController.introspect(req, mockRes);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.MISSING_PARAMS);
            sinon.assert.calledWith(mockRes.json, errorMsg);
        });

        it("status 401: returns unauthorized if invalid token is sent", async () => {
            stubs.userValidator.validationResult.returns(emptyValidationError());
            req.query.token = "not a token";
            await authController.introspect(req, mockRes);
            sinon.assert.calledWith(mockRes.status, statusCodes.UNAUTHORIZED);
        });
    });

    describe("Login", () => {

        let req;
        beforeEach(() => {
            req = mockReq({
                body: {
                    email: testUser.email,
                    password: "password"
                }
            });
        });

        it("status 200: returns new user", async () => {
            stubs.userValidator.validationResult.returns(emptyValidationError());
            stubs.userDB.findByEmail.returns(testUser);
            stubs.userUtil.codeforces.updateUserProblems.returns();
            stubs.jwt.sign.returns(testToken);
            await authController.login(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.findByEmail);
            sinon.assert.calledOnce(stubs.userUtil.codeforces.updateUserProblems);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.SUCCESS);
            const tmp = testUser.toJSON();
            delete tmp.password;
            // sinon.assert.calledWith(mockRes.json, { token: testToken, user: tmp });
        });

        it("status 400: returns an appropriate response if user doesn't exist", async () => {
            stubs.userValidator.validationResult.returns(emptyValidationError());
            stubs.userDB.findByEmail.returns(null);
            await authController.login(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.findByEmail);
            sinon.assert.calledWith(mockRes.status, statusCodes.BAD_REQUEST);
            sinon.assert.calledWith(mockRes.json, { status: statusCodes.BAD_REQUEST, message: "Invalid email or password" });
        });

        it("status 400: returns an appropriate response if email and password don't match", async () => {
            req.body.password = "bad password";
            stubs.userValidator.validationResult.returns(emptyValidationError());
            stubs.userDB.findByEmail.returns(testUser);
            await authController.login(req, mockRes);
            sinon.assert.calledOnce(stubs.userDB.findByEmail);
            sinon.assert.calledWith(mockRes.status, statusCodes.BAD_REQUEST);
            sinon.assert.calledWith(mockRes.json, { status: statusCodes.BAD_REQUEST, message: "Invalid email or password" });
        });

        it("status 422: returns an appropriate response with validation errors", async () => {
            const errorMsg = { status: statusCodes.MISSING_PARAMS, message: "body[email]: Invalid or missing 'email'" };
            req.body.email = "not an email";
            stubs.userValidator.validationResult.returns(validationErrorWithMessage(errorMsg));
            await authController.login(req, mockRes);
            sinon.assert.calledOnce(stubs.userValidator.validationResult);
            sinon.assert.calledWith(mockRes.status, statusCodes.MISSING_PARAMS);
            sinon.assert.calledWith(mockRes.json, errorMsg);
        });

        it("status 500: returns an appropriate response if server fails", async () => {
            stubs.userValidator.validationResult.returns(emptyValidationError());
            stubs.userDB.findByEmail.throws();
            await authController.login(req, mockRes);
            sinon.assert.calledWith(mockRes.status, statusCodes.SERVER_ERROR);
        });
    });
});