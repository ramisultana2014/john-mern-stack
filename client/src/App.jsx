import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  HomeLayout,
  Landing,
  Register,
  Stats,
  Login,
  DashboardLayout,
  Error,
  AddJob,
  Profile,
  AllJobs,
  Admin,
  EditJob,
} from "./pages";
import { action as registerAction } from "./pages/Register";
import { action as logInAction } from "./pages/Login";
import { action as addJobAction } from "./pages/AddJob";
import { loader as alljobsLoader } from "./pages/AllJobs";
import { loader as dashboardLoader } from "./pages/DashboardLayout";
import { loader as editJobLoader } from "./pages/EditJob";
import { loader as adminLoader } from "./pages/Admin";
import { loader as statsLoader } from "./pages/Stats";
import { action as editJobAction } from "./pages/EditJob";
import { action as deleteJobAction } from "./pages/DeleteJob";
import { action as profileAction } from "./pages/Profile";
export const checkDefaultTheme = () => {
  //here we check if isDarkTheme true or false
  const isDarkTheme = localStorage.getItem("darkTheme") === "true";
  // then if isDarkTheme is true will add class dark-theme to body , if false it will remove it
  document.body.classList.toggle("dark-theme", isDarkTheme);
  return isDarkTheme;
  //
};
checkDefaultTheme();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true, // that mean when we http://localhost:5173/ the Outlet will be the Landing,
        element: <Landing />,
      },
      {
        // http://localhost:5173/register outlet will be register page
        path: "register",
        element: <Register />,
        action: registerAction,
      },
      {
        // http://localhost:5173/login
        path: "login",
        element: <Login />,
        action: logInAction,
      },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        loader: dashboardLoader,
        children: [
          // that mean when we http://localhost:5173/dashboard the Outlet inside DashboardLayout  will be AddJob page,
          {
            index: true,
            element: <AddJob />,
            action: addJobAction,
          },
          {
            // http://localhost:5173/dashboard/stats
            // that mean when we http://localhost:5173/dashboard the Outlet inside DashboardLayout  will be stats page,
            path: "stats",
            element: <Stats />,
            loader: statsLoader,
          },
          {
            // http://localhost:5173/dashboard/all-jobs
            path: "all-jobs",
            element: <AllJobs />,
            loader: alljobsLoader,
          },
          {
            path: "profile",
            element: <Profile />,
            action: profileAction,
          },
          {
            path: "admin",
            element: <Admin />,
            loader: adminLoader,
          },
          {
            path: "edit-job/:id",
            element: <EditJob />,
            loader: editJobLoader,
            action: editJobAction,
          },
          {
            path: "delete-job/:id",
            action: deleteJobAction,
          },
        ],
      },
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
