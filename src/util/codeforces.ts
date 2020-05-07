import axios from "axios";
import crypto from "crypto";
import { IUserModel } from "../database/models/user";
import { IProblem } from "../interfaces/IProblem";

export const codeforces = {

    updateUserProblems: async (user: IUserModel) => {
        const response = await axios.get("https://codeforces.com/api/user.status?handle=" + user.platformData.codeforces.username);
        const submissions = response.data.result;

        let lastSubmission: IProblem;
        const problems: IProblem[] = [];
        submissions.some((submission, i: number) => {
            const problemId: string = crypto.createHash("sha1").update("codeforces" + submission.problem.contestId + submission.problem.index).digest("hex");
            const status: string = submission.verdict;
            const isComplete: boolean = codeforces.convertStatus(status);
            const problem: IProblem = {
                problemId,
                isComplete,
                status
            };

            if (i == 0) lastSubmission = problem;
            if (problemId == user.platformData.codeforces.lastSubmission.problemId && status == user.platformData.codeforces.lastSubmission.status) return true;

            const problemIndex = problems.findIndex((problem) => problem.problemId === problemId);
            if (problemIndex == -1) problems.push(problem);
            else problems[problemIndex] = problem;
        });

        // ////////////////////////////////
        // Verify that problem exists in problems microservice
        // ////////////////////////////////

        user.platformData.codeforces.lastSubmission = lastSubmission;

        problems.some(problem => {
            const problemIndex = user.problems.findIndex((dbProblem) => problem.problemId === dbProblem.problemId);
            if (problemIndex == -1) user.problems.push(problem);
            else user.problems[problemIndex] = problem;
        });

        await user.save();
    },

    convertStatus: (status: string) => {
        const incomplete = ["FAILED", "PARTIAL", "COMPILATION_ERROR", "RUNTIME_ERROR", "WRONG_ANSWER", "PRESENTATION_ERROR", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "IDLENESS_LIMIT_EXCEEDED", "SECURITY_VIOLATED", "CRASHED", "INPUT_PREPARATION_CRASHED", "CHALLENGED", "SKIPPED", "TESTING", "REJECTED"];

        if (status == "OK") return true;
        else if (incomplete.includes(status)) return false;
        else return false;
    }
};