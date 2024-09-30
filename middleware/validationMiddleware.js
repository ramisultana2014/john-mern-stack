import mongoose from "mongoose";
import { body, validationResult, param } from "express-validator"; // validate the body
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import { JOB_STATUS, JOB_TYPE } from "../utils/constants.js";
import Job from "../models/JobModel.js";
import User from "../models/UserModel.js";
const withValidationErrors = (validateValues) => {
  // we return [] because withValidationErrors have tow middleware first one is validateValues and second one is (req, res, next) , and in express thats the way to let tow middleware work together is to put them inside [] when we want return them
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      // here we look at the req and check for the logic in  validateValues, for example validateValues is  an array contain
      //[ body("name")
      //         .notEmpty()
      //         .withMessage("name is required")
      //         .isLength({ min: 10 })
      //         .withMessage("name must be at least 10 character"),]
      //validationResult(req) have many methods one of them isEmpty(), which mean if there is errors it will gave us false , if there is no errors it gave us true
      //console.log(errors);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        //errors in sample form be like
        //         // type: 'field',
        //         // value: '',
        //         // msg: 'name is required',
        //         // path: 'name',
        //         // location: 'body'
        if (errorMessages[0].startsWith("no job")) {
          throw new NotFoundError(errorMessages);
        }
        if (errorMessages[0].startsWith("not authorized")) {
          throw new UnauthorizedError("not authorized to access this route");
        }
        throw new BadRequestError(errorMessages);
        // BadRequestError,NotFoundError instead of return res.status(400/401).json, will create error catch by express-async-errors in server.js and send it down to app.use((err, req, res, next)
      }
      next();
    },
  ];
};

// app.post(
//     "/test",
//     [
//       body("name")
//         .notEmpty()
//         .withMessage("name is required")
//         .isLength({ min: 10 })
//         .withMessage("name must be at least 10 character"),
//     ],
//     (req, res, next) => {
//       const errors = validationResult(req); // here we look at the req and check for this logic: body("name").notEmpty().withMessage("name is required").
//       if (!errors.isEmpty()) {
//         const errorMessages = errors.array().map((error) => error.msg);
//         return res.status(400).json({ errors: errorMessages });
//
//       }
//       console.log(errors);
//       next();
//     },
//     (req, res) => {
//       const { name } = req.body;
//       res.json({ msg: `hello ${name}` });
//     }
//   );
export const validateTest = withValidationErrors([
  // we use it server.js
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("name must be between 3 and 50 characters long")
    .trim(),
]);
// in jobRouter.js
export const validateJobInput = withValidationErrors([
  body("company").notEmpty().withMessage("company is required"),
  body("position").notEmpty().withMessage("position is required"),
  body("jobLocation").notEmpty().withMessage("job location is required"),
  body("jobStatus")
    .isIn(Object.values(JOB_STATUS))
    .withMessage("invalid status value"),
  body("jobType").isIn(Object.values(JOB_TYPE)).withMessage("invalid job type"),
]);
// isIn like it check the array for jobStatus value

export const validateIdParam = withValidationErrors([
  // "id" is our params name in route
  param("id").custom(async (value, { req }) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) throw new BadRequestError("invalid MongoDB id");
    const job = await Job.findById(value);
    if (!job) throw new NotFoundError(`no job with id : ${value}`);
    const isAdmin = req.user.role === "admin";
    //in the server app.use("/api/v1/jobs", authenticateUser, jobRouter);
    const isOwner = req.user.userId === job.createdBy.toString();
    if (!isAdmin && !isOwner)
      throw new Error("not authorized to access this route");
  }),
  //important notice : inside custom the BadRequestError and NotFoundError purpose is just to create error with the message provided (which is what we want the message) , the actual error that will catch by express-async-errors coming from  (!errors.isEmpty()){ throw new} inside withValidationErrors, so we can just write throw new Error like in validateRegisterInput
]);
export const validateRegisterInput = withValidationErrors([
  body("name").notEmpty().withMessage("name is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("email already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long"),
  body("location").notEmpty().withMessage("location is required"),
  body("lastName").notEmpty().withMessage("last name is required"),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format"),
  // .custom(async (email) => {
  //   const user = await User.findOne({ email });
  //   if (!user) {
  //     throw new Error("please register first");
  //   }
  // })
  body("password").notEmpty().withMessage("password is required"),
]);
export const validateUpdateUserInput = withValidationErrors([
  body("name").notEmpty().withMessage("name is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      //this line is for we cant use another user email to update our account
      if (user && user._id.toString() !== req.user.userId) {
        throw new Error("email already exists");
      }
    }),
  body("lastName").notEmpty().withMessage("last name is required"),
  body("location").notEmpty().withMessage("location is required"),
]);
