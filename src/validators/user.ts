import { body, param, ValidationChain } from "express-validator/check";

export function userValidator(method: string): ValidationChain[] {
    switch (method) {
        case "GET /users": {
            return [];
        }
        case "GET /users/:userId": {
            return [
                param("userId", "Invalid or missing ':userId'").exists().isMongoId()
            ];
        }
        case "POST /users": {
            return [
                body("email", "Invalid or missing 'email'").exists().isEmail(),
                body("password", "Invalid or missing 'password'").exists().isString()
            ];
        }
        case "PUT /users/:userId": {
            return [
                param("userId", "Invalid or missing ':userId'").exists().isString(),
                body("email", "Invalid 'email'").optional().isEmail(),
                body("password", "Invalid 'password'").optional().isString()
            ];
        }
        case "PATCH /users/:userId/problems": {
            return [
                param("userId", "Invalid or missing ':userId'").exists().isMongoId(),
                body("problemId", "Invalid or missing 'problemId'").exists().isString(),
                body("isComplete", "Invalid or missing 'isComplete'").exists().isBoolean(),
                body("status", "Invalid or missing 'status'").exists().isString()
            ];
        }
        case "PATCH /users/:userId/problemSets": {
            return [
                param("userId", "Invalid or missing ':userId'").exists().isMongoId(),
                body("problemSetId", "Invalid or missing 'problemId'").exists().isMongoId()
            ];
        }
        case "DELETE /users/:userId": {
            return [
                param("userId", "Invalid or missing ':userId'").exists().isMongoId()
            ];
        }
    }
}