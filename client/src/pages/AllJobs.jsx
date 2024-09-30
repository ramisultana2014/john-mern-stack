import { toast } from "react-toastify";
import { JobsContainer, SearchContainer } from "../components";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useContext, createContext } from "react";
export const loader = async ({ request }) => {
  try {
    const { data } = await customFetch.get("/jobs");
    return {
      data,
    };
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};
const AlljobsContext = createContext();
function AllJobs() {
  const { data } = useLoaderData();
  //console.log(data);
  return (
    <AlljobsContext.Provider value={{ data }}>
      <SearchContainer />
      <JobsContainer />
    </AlljobsContext.Provider>
  );
}
export const useAllJobsContext = () => useContext(AlljobsContext);
export default AllJobs;
