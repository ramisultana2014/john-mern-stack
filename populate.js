import { readFile } from "fs/promises";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Job from "./models/JobModel.js";
import User from "./models/UserModel.js";
try {
  await mongoose.connect(process.env.DATABASE);
  //const user = await User.findOne({ email: "test@test.com" });
  const user = await User.findOne({ email: "john@gmail.com" });
  // because we use es6 that the way we read file
  const jsonJobs = JSON.parse(
    await readFile(new URL("./utils/MOCK_DATA.json", import.meta.url))
  );
  const jobs = jsonJobs.map((job) => {
    return { ...job, createdBy: user._id };
  });
  await Job.deleteMany({ createdBy: user._id }); // here we delete everything befor upload our new data
  await Job.create(jobs); // here we upload our new data
  console.log("Success!!!");
  process.exit(0);
} catch (error) {
  console.log(error);
  process.exit(1);
}
