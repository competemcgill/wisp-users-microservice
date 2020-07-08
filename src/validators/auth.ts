import { body, query, ValidationChain } from "express-validator/check";
import { validHttpMethod } from "./authCustom";

export function authValidator(method: string): ValidationChain[] {
    switch (method) {
        case "POST /auth/login": {
            return [
                body("email", "Missing 'email'").exists(),
                body("email", "Invalid 'email'").isEmail(),
                body("password", "Missing 'password'").exists(),
                body("password", "Invalid 'password'").isString()
            ];
        }
        case "POST /auth/introspect": {
            return [
                query("token", "Missing 'token'").exists(),
                query("uri", "Missing 'uri'").exists().isLength({ min: 1 }),
                query("method", "Missing 'method'").exists(),
                query("method", "Invalid 'method'").custom(validHttpMethod)
            ];
        }
    }
}
