import { mailer } from "../app";
import { MailDataRequired } from "@sendgrid/mail";
import { logger } from "../config/logger";
import { IUserModel } from "database/models/user";


export async function sendConfirmationEmail(user: IUserModel) {
    const emailToSend: MailDataRequired = {
        to: user.email,
        from: 'compete.mcgill@gmail.com',
        subject: 'Confirm your email to activate your WISP account',
        html: `
        <h1>Welcome to WISP</h1>
        <div>Thanks for signing up for <a href="https://wisp.training" target="_blank">WISP</a>. To activate your account,
        please click the link below. If you didn't sign up for an
        account on WISP recently, then ignore this email.</div>
        <br />
        <a href="https://wisp.training/some_path" target="_blank"><button>Confirm Email</button></a>
        `
    };
    try {
        const response = await mailer.send(emailToSend);
        logger.info(`Confirmation email sending response: ${response}`);
    } catch (error) {
        logger.error(`Unable to send confirmation email: ${error}`);
    }
}