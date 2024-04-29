import express from "express";
import db from "./config/Database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
// import User from "./models/UserModel.js";
import router from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT;

try {
    await db.authenticate();
    console.log("database connected..");
    //     Mengenerate tabel user ketika tabel user belum ada di database
    //     await User.sync();
} catch (error) {
    console.log(error);
}

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use(router);

app.listen(port, () => {
    console.log(`server is running on port ${port}..`);
});
