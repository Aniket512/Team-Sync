import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Outlet, useParams } from "react-router-dom";
import { Notifications } from "../components/ui/Notifications";
import { UserNav } from "../components/ui/UserNav";
import { Button } from "@nextui-org/react";
import Sidebar from "../components/Dashboard/Sidebar";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import { useAppDispatch } from "../redux/hooks";
import { setCurrentProject } from "../redux/slices/projectSlice";
import { getOrUpdateProject } from "../api/urls";
import { getUserId } from "../configs/auth";
import { socket } from "../configs/SocketProvider";
import apiClient from "../api/apiClient";

export const DashboardLayout = () => {
  const { projectId } = useParams();
  const userId = getUserId();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const socketRef = useRef(socket);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    apiClient
      .get(getOrUpdateProject(projectId))
      .then((res) => {
        dispatch(setCurrentProject(res?.data));
      });
  }, [dispatch, projectId]);
  
  // Register presence on mount, project change, and every socket reconnect
  useEffect(() => {
    if (!userId || !projectId) return;

    const joinPresence = () => {
      socketRef.current.emit("add-user", userId, projectId);
      // Ask server for a fresh online list (covers late Dashboard listeners)
      socketRef.current.emit("request-users", projectId);
    };

    joinPresence();
    socketRef.current.on("connect", joinPresence);

    return () => {
      socketRef.current.off("connect", joinPresence);
      // Leave this project's presence when navigating away / unmounting
      socketRef.current.emit("leave-user");
    };
  }, [userId, projectId]);

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
