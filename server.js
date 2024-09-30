import "express-async-errors";
//express-async-errors handle the catch in try catch in controller and send it to app.use((err, req, res, next) below
import { StatusCodes } from "http-status-codes"; //A library for HTTP status codes
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import morgan from "morgan";
// routers
import jobRouter from "./routers/jobRouter.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";

//step 1 to read public folder
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

// middleware
import { validateTest } from "./middleware/validationMiddleware.js";
import { authenticateUser } from "./middleware/authMiddleware.js";

//cloud settings
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
//step 2:  because we are using es6 we dont have access to __dirname so we do it like this
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, "./public")));

if (process.env.NODE_ENV === "development") {
  // just console our req url like POST / 200 67.568 ms - 40
  app.use(morgan("dev"));
}
app.use(cookieParser()); // read the req.cookies
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("heloooo");
// });
app.post(
  "/test",

  validateTest,
  (req, res) => {
    const { name } = req.body;
    res.json({ msg: `hello ${name}` });
  }
);
app.get("/api/v1/test", (req, res) => {
  res.json({ msg: "test route" });
});
//authenticateUser it check if there is a token then put the role and userId to req.user, if not gave error
app.use("/api/v1/jobs", authenticateUser, jobRouter);
app.use("/api/v1/users", authenticateUser, userRouter);
app.use("/api/v1/auth", authRouter);
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./public", "index.html"));
});
app.use("*", (req, res) => {
  //catch error for unknown routes
  res.status(404).json({ msg: "not route was found" });
});

app.use((err, req, res, next) => {
  //catch error coming from our controller send by express-async-errors , its check if the error created by functions inside customErrors.js or provide custom message
  //console.log(err);// the error we created have message and statuscode
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; //mean 500
  const msg = err.message || "something went wrong, try again later";
  res.status(statusCode).json({ msg });
});

const port = process.env.PORT || 5100;
try {
  await mongoose.connect(process.env.DATABASE);
  app.listen(port, () => {
    console.log(`server running on port ${port}....`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
// app.listen(port, () => {
//   console.log(`server runninig on port ${port}....`);
// });
