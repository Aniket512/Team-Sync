import axios from "axios";
import { useEffect } from "react";
import ProjectCard from "../components/Projects/ProjectCard";
import { Notifications } from "../components/ui/Notifications";
import { UserNav } from "../components/ui/UserNav";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import AddProject from "../components/Projects/AddProject";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setProjects } from "../redux/slices/projectSlice";
import { getHeaders, getProjects } from "../api/urls";

export default function Projects() {
  const { projects } = useAppSelector((state) => state.projects);
  const dispatch = useAppDispatch();

  useEffect(() => {
    axios
      .get(getProjects(), {
        headers: getHeaders(),
      })
      .then((res) => {
        dispatch(setProjects(res?.data));
      });
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-1 border-b border-border h-[4.5rem] flex items-center justify-between">
        {/* <Link to="/">
          <Image src={fullLogo} alt="app logo" width={120} />
        </Link> */}
        <div className="flex items-center grow">
          <div className="ml-auto flex items-center gap-2">
            <Notifications />
            <UserNav />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      <div className="p-4">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Your Projects</h2>
          <AddProject />
        </div>
        {projects.length > 0 ? (
          <div className="grid gap-2 grid-cols-12">
            {projects.map((project) => (
              <div
                key={project._id}
                className="col-span-12 md:col-span-6 lg:col-span-3 mx-2"
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <div>You do not have any projects.</div>
        )}
      </div>
    </div>
  );
}
