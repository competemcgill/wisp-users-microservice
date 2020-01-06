import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port: string = process.env.SERVER_PORT;

if (port == "") {
    // tslint:disable-next-line:no-console
    console.log("Missing environment variables for configuration (check .env.example and create a .env)")
    process.exit(1);
}

app.get("/users", (req, res) => {
    res.send("listUser");
});

app.get("/user", (req, res) => {
    res.send("showUserById");
});

app.post("/user", (req, res) => {
    res.send("createUser");
});

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Server started at http://localhost:${port}`);
});
