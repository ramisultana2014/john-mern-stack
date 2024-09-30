import { StatusCodes } from "http-status-codes";
import User from "../models/UserModel.js";
import Job from "../models/JobModel.js";
import cloudinary from "cloudinary";
import { promises as fs } from "fs";
////authenticateUser in server.js , check if there is a token then put the role and userId to req.user, if not gave error
export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  res.status(StatusCodes.OK).json({ user });
};

export const getApplicationStats = async (req, res) => {
  const users = await User.countDocuments();
  const jobs = await Job.countDocuments();
  res.status(StatusCodes.OK).json({ users, jobs });
};

export const updateUser = async (req, res) => {
  //console.log(req.file);coming from multer
  // {
  //      fieldname: 'avatar',
  //      originalname: 'avatar-1.webp',
  //      encoding: '7bit',
  //      mimetype: 'image/webp',
  //      destination: 'public/uploads',
  //      filename: 'avatar-1.webp',
  //     path: 'public/uploads/avatar-1.webp',
  //     size: 24104
  //    }
  const newUser = { ...req.body };
  delete newUser.password;
  if (req.file) {
    const response = await cloudinary.v2.uploader.upload(req.file.path); //here we upload the file to cloudinary
    await fs.unlink(req.file.path); //here we remove the file from public/uploads which was created with multer.
    // our model have
    //  avatar: String,
    //avatarPublicId: String,
    // look at LogoutContainer.jsx
    newUser.avatar = response.secure_url;
    newUser.avatarPublicId = response.public_id;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.userId, newUser);
  //updatedUser is the old document because we didnt write new:true
  if (req.file && updatedUser.avatarPublicId) {
    //this code to delete old image in cloudinary
    await cloudinary.v2.uploader.destroy(updatedUser.avatarPublicId);
  }
  res.status(StatusCodes.OK).json({ msg: "update user" });
};
