import { expect } from "chai";
import { codeforces } from "../../../src/util/codeforces";

describe("Codeforces util", () => {
    describe("ConvertStatus", () => {
        it("Converts codeforces statuses to appropriate boolean", () => {
            const incomplete = ["FAILED", "PARTIAL", "COMPILATION_ERROR", "RUNTIME_ERROR", "WRONG_ANSWER", "PRESENTATION_ERROR", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "IDLENESS_LIMIT_EXCEEDED", "SECURITY_VIOLATED", "CRASHED", "INPUT_PREPARATION_CRASHED", "CHALLENGED", "SKIPPED", "TESTING", "REJECTED"];
            const complete = ["OK"];

            for (const statusMsg of incomplete) {
                const status = codeforces.convertStatus(statusMsg);
                expect(status).to.equal(false);
            }
            for (const statusMsg of complete) {
                const status = codeforces.convertStatus(statusMsg);
                expect(status).to.equal(true);
            }
        });
    });

    describe("UpdateUserProblems", () => {
        it("Updates the user's codeforces problems", () => {
            // TODO
        });
    });
});