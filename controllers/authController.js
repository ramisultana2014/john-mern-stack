import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { UnauthenticatedError } from "../errors/customErrors.js";
import { createJWT } from "../utils/tokenUtils.js";
export const register = async (req, res) => {
  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments()) === 0;
  req.body.role = isFirstAccount ? "admin" : "user";
  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({
    msg: "user created",
  });
};
//return res.status(404).json({ msg: `no job was found with that id ${id}` });
//   throw new NotFoundError(`no job was found with that id ${id}`);
//instead above we create error with customErrors.js which create error with statuscode 404 and message wwe provided then that error catch by express-async-errors in server.js then to
//app.use((err, req, res, next) => {
//catch error coming from our controller and check if the error contain statuscode and message
export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  if (!user) throw new UnauthenticatedError("invalid credentials");
  const isPasswordCorrect = await comparePassword(
    req.body.password,
    user.password
  );
  if (!isPasswordCorrect) throw new UnauthenticatedError("invalid credentials");
  const token = createJWT({ userId: user._id, role: user.role });
  // cookie and token prefer have the same expire time
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
  });
  user.password = undefined;
  res.status(StatusCodes.CREATED).json({ msg: "user logged in" });
};
export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};
