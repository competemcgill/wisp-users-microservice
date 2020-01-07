import { app, port } from "./app";
import mongoose from "mongoose";

const dbUsername = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb://localhost:27017/wisp`, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const server = app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Server started at http://localhost:${port}`);
});

export { server };
