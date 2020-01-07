import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { Application, Request, Response } from "express";

import { userRouter } from "./routes/user";

dotenv.config();

const app: Application = express();
const port: string = process.env.SERVER_PORT;

app.use(bodyParser.json());
app.use(cors());
app.use("/users", userRouter);

if (port == "") {
    // tslint:disable-next-line:no-console
    console.log("Missing environment variables for configuration (check .env.example and create a .env)")
    process.exit(1);
}

export { app, port }