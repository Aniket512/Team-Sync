import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Outlet, useParams } from "react-router-dom";
import { Notifications } from "../components/ui/Notifications";
import { UserNav } from "../components/ui/UserNav";
import { Button } from "@nextui-org/react";
import Sidebar from "../components/Sidebar";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import { useAppDispatch } from "../redux/hooks";
import { setCurrentProject } from "../redux/slices/projectSlice";
import { getHeaders, getOrUpdateProject } from "../api/urls";
import axios from "axios";

export const DashboardLayout = () => {
  const { projectId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if(!projectId){
      return;
    }
    axios.get(getOrUpdateProject(projectId), {
      headers: getHeaders()
    }).then((res) => {
      dispatch(setCurrentProject(res?.data));
    })
  }, [projectId]);

  return (
    <div className="flex-col">
      <div className="flex h-full">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="grow h-full flex flex-col max-h-full overflow-x-hidden">
          <header className="px-3 py-1 border-b border-border h-[4.5rem] flex items-center">
            <div className="flex items-center grow">
              <Button
                onClick={() => setSidebarOpen((prev) => !prev)}
                variant="bordered"
                isIconOnly
                className={`transition-all duration-100 md:hidden 
                  ${sidebarOpen ? "ml-[4.5rem]" : "ml-0"}`}
              >
                {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Notifications />
                <UserNav />
                <ThemeSwitcher />
              </div>
            </div>
          </header>
          <div className="grow flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
