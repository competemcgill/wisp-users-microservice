import { body, param, ValidationChain } from "express-validator/check";
import {
    validUsername,
    validPassword,
    hasCodeforcesUserData,
    hasCodeforcesUsername
} from "./userCustom";

export function userValidator(method: string): ValidationChain[] {
    switch (method) {
        case "GET /users": {
            return [];
        }
        case "GET /users/:userId": {
            return [param("userId", "Invalid ':userId'").isMongoId()];
        }
        case "POST /users": {
            return [
                body("username", "Missing 'username'").exists(),
                body(
                    "username",
                    "'username' must be alphanumeric, and the only allowed characters are '_' '-' '.'"
                )
                    .isString()
                    .custom(validUsername),
                body("email", "Missing 'email'").exists(),
                body("email", "Invalid 'email'").isEmail(),
                body("password", "Missing 'password'").exists(),
                body(
                    "password",
                    "'password' must be at least 6 characters long, and cannot contain spaces"
                )
                    .isString()
                    .custom(validPassword),
                body("platformData", "Missing 'platformData'").exists(),
                body(
                    "platformData",
                    "Missing 'platformData.codeforces'"
                ).custom(hasCodeforcesUserData),
                body(
                    "platformData",
                    "Missing 'platformData.codeforces.username"
                ).custom(hasCodeforcesUsername)
            ];
        }
        case "PUT /users/:userId": {
            return [
                param("userId", "Invalid ':userId'").isString(),
                body("username", "Missing 'username'").exists(),
                body(
                    "username",
                    "'username' must be alphanumeric, and the only allowed characters are '_' '-' '.'"
                )
                    .isString()
                    .custom(validUsername),
                body("email", "Missing 'email'").exists(),
                body("email", "Invalid 'email'").isEmail(),
                body("platformData", "Missing 'platformData'").exists(),
                body(
                    "platformData",
                    "Missing 'platformData.codeforces'"
                ).custom(hasCodeforcesUserData),
                body(
                    "platformData",
                    "Missing 'platformData.codeforces.user"
                ).custom(hasCodeforcesUsername),
                body("password", "Invalid 'password'").optional().isString(),
                body(
                    "password",
                    "'password' must be at least 6 characters long, and cannot contain spaces"
                ).custom(validPassword)
            ];
        }
        case "PATCH /users/:userId/problems": {
            return [
                param("userId", "Invalid ':userId'").isMongoId(),
                body("problemId", "Missing 'problemId'").exists(),
                body("problemId", "Invalid 'problemId'").isString(),
                body("isComplete", "Missing 'isComplete'").exists(),
                body("isComplete", "Invalid 'isComplete'").isBoolean(),
                body("status", "Missing 'status'").exists(),
                body("status", "Invalid 'status'").isString()
            ];
        }
        case "PATCH /users/:userId/problemSets": {
            return [
                param("userId", "Invalid ':userId'").isMongoId(),
                body("problemSetId", "Missing 'problemId'").exists(),
                body("problemSetId", "Invalid 'problemId'").isMongoId()
            ];
        }
        case "DELETE /users/:userId": {
            return [param("userId", "Invalid ':userId'").isMongoId()];
        }
    }
}
