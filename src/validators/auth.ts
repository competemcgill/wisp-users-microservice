import { body, query, ValidationChain } from "express-validator/check";

export function authValidator(method: string): ValidationChain[] {
    switch (method) {
        case "POST /auth/login": {
            return [
                body("email", "Invalid or missing 'email'").exists().isEmail(),
                body("password", "Invalid or missing 'password'").exists().isString()
            ];
        }
        case "POST /auth/introspect": {
            return [
                query("token", "Missing 'token'").exists()
            ];
        }
    }
}