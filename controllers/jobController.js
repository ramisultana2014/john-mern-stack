import Job from "../models/JobModel.js";
import mongoose from "mongoose";
import day from "dayjs";
import { StatusCodes } from "http-status-codes"; //A library for HTTP status
import { NotFoundError } from "../errors/customErrors.js";
// we no more write try{}catch(){} because express-async-errors in server.js handle the error   in any controller so no need to write try{}catch(err){}any more
export const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId });
  res.status(StatusCodes.OK).json({ jobs });
};
//// we no more write try{}catch(){} because express-async-errors in server.js handle the error   in any controller so no need to write try{}catch(err){}any more
export const createJob = async (req, res) => {
  //const { company, position } = req.body;
  // await Job.create({company,position})
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "success", job });
};
//// we no more write try{}catch(){} because express-async-errors in server.js handle the error  catch in any controller so no need to write try{}catch(err){}any more
export const getJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  // if (!job) {
  //return res.status(404).json({ msg: `no job was found with that id ${id}` });
  //   throw new NotFoundError(`no job was found with that id ${id}`);
  //instead above we create error with customErrors.js which create error with statuscode 404 and message wwe provided then that error catch by express-async-errors in server.js then to
  //app.use((err, req, res, next) => {
  //catch error coming from our controller and check if the error contain statuscode and message
  // });
  // }
  //  all above replaced with logic in jobRoutes
  res.status(StatusCodes.OK).json({ status: "success", job });
};
//// we no more write try{}catch(){} because express-async-errors in server.js handle the error   in any controller so no need to write try{}catch(err){}any more
export const updateJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findByIdAndUpdate(id, req.body, {
    new: true, //will return the update doc
  });
  // if (!job) {
  //   // return res.status(404).json({ msg: `no job with id ${id}` });
  //   throw new NotFoundError(`no job was found with that id ${id}`);
  // }
  // replaced with logic in jobRoutes
  res.status(StatusCodes.OK).json({ msg: "job modified", job });
};
//// we no more write try{}catch(){} because express-async-errors in server.js handle the error   in any controller so no need to write try{}catch(err){}any more
export const deleteJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findByIdAndDelete(id);
  // if (!job) {
  //   // return res.status(404).json({ msg: `no job with id ${id}` });
  //   throw new NotFoundError(`no job was found with that id ${id}`);
  // }
  // replaced with logic in jobRoutes
  res.status(StatusCodes.OK).json({ msg: "job deleted", job });
};

export const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    // $match will bring all document that createdBy a user and since in the model user the createdBy is obj we need to read it like this
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    // $group will but them into group according to jobStatus and count them by $sum
    //here the _id belong to $group
    { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
  ]);
  // console.log(stats); [{ _id: 'interview', count: 32 },{ _id: 'declined', count: 45 },{ _id: 'pending', count: 23 }]
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});
  // with the reduce we transform the first stats array to object
  //console.log(stats);{ interview: 32, declined: 45, pending: 23 }
  const defaultStats = {
    //we need to put 0 in case there is no matching document
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };
  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        // when we want to group document according to month we alos need to group them to year cuz a month must belong to year
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 }, // here for 6 month
  ]);
  // console.log(monthlyApplications);
  // [
  //      { _id: { year: 2024, month: 9 }, count: 8 },
  //      { _id: { year: 2024, month: 8 }, count: 8 },
  //      { _id: { year: 2024, month: 7 }, count: 12 },
  //      { _id: { year: 2024, month: 6 }, count: 7 },
  //      { _id: { year: 2024, month: 5 }, count: 11 },
  //      { _id: { year: 2024, month: 4 }, count: 10 }
  //    ]
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format("MMM YY");
      return { date, count };
    })
    .reverse();
  //console.log(monthlyApplications);
  // [
  //      { date: 'Sep 24', count: 8 },
  //      { date: 'Aug 24', count: 8 },
  //      { date: 'Jul 24', count: 12 },
  //      { date: 'Jun 24', count: 7 },
  //      { date: 'May 24', count: 11 },
  //     { date: 'Apr 24', count: 10 }
  //    ]

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
// {
//   "defaultStats": {
//     "pending": 23,
//     "interview": 32,
//     "declined": 45
//   },
//   "monthlyApplications": [
//     {
//       "date": "Sep 24",
//       "count": 8
//     },
//     {
//       "date": "Aug 24",
//       "count": 8
//     },
//     {
//       "date": "Jul 24",
//       "count": 12
//     },
//     {
//       "date": "Jun 24",
//       "count": 7
//     },
//     {
//       "date": "May 24",
//       "count": 11
//     },
//     {
//       "date": "Apr 24",
//       "count": 10
//     }
//   ]
// }
