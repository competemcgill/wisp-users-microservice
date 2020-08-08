import sinon from "sinon";
import check from "express-validator/check";
import { userDBInteractions } from "../../../src/database/interactions/user";
import { codeforces } from "../../../src/util/codeforces";

export const userDBInteractionsStubs = () => {
    return {
        create: sinon.stub(userDBInteractions, "create"),
        all: sinon.stub(userDBInteractions, "all"),
        find: sinon.stub(userDBInteractions, "find"),
        findByEmail: sinon.stub(userDBInteractions, "findByEmail"),
        findByUsername: sinon.stub(userDBInteractions, "findByUsername"),
        update: sinon.stub(userDBInteractions, "update"),
        delete: sinon.stub(userDBInteractions, "delete"),
        resetLastSubmissions: sinon.stub(
            userDBInteractions,
            "resetLastSubmissions"
        ),

        restore() {
            this.create.restore();
            this.all.restore();
            this.find.restore();
            this.findByEmail.restore();
            this.findByUsername.restore();
            this.update.restore();
            this.delete.restore();
            this.resetLastSubmissions.restore();
        }
    };
};

export const userValidatorStubs = () => {
    return {
        validationResult: sinon.stub(check, "validationResult"),

        restore() {
            this.validationResult.restore();
        }
    };
};

export const userUtilStubs = () => {
    return {
        codeforces: {
            updateUserProblems: sinon.stub(codeforces, "updateUserProblems")
        },

        restore() {
            this.codeforces.updateUserProblems.restore();
        }
    };
};
