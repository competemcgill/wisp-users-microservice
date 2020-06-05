import { body, query, ValidationChain } from "express-validator/check";

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
            return [query("token", "Missing 'token'").exists()];
        }
    }
}
