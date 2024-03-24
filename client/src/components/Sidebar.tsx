import { Button } from "@nextui-org/react";
import { ArrowLeft, Loader2, Presentation, ScrollText } from "lucide-react";

import {
  LayoutDashboard,
  MessagesSquare,
  CalendarDays,
  Vote,
  Settings,
  Users,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { SidebarProps } from "../utils/types";
import { useAppSelector } from "../redux/hooks";

export default function Sidebar({ open }: SidebarProps) {
  const project = useAppSelector((state) => state.projects.currentProject);

  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`border-r border-border md:w-[275px] lg:w-[320px] bg-white dark:bg-gray-800 shrink-0 fixed md:static md:left-auto z-50 inset-y-0 md:inset-y-auto transition-all duration-100 shadow-lg md:shadow-none
        ${open ? "left-0" : "-left-56"}`}
    >
      <div className="space-y-4 h-full">
        <div className="px-1 md:px-3 py-2 h-full flex flex-col">
          <div className="mb-2 p-4 flex items-center border-b border-border h-16">
            <Users size={24} className="mr-2" />
            <h2 className="hidden md:block text-lg font-semibold tracking-tight">
              {project ? (
                project.name
              ) : (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </h2>
          </div>

          {project ? (
            <div className="space-y-1 grow">
              <NavLink to={`/projects/${project?._id}/dashboard`}>
                <div
                  className={
                    isActive(`/projects/${project?._id}/dashboard`)
                      ? "bg-default-200 rounded-lg"
                      : ""
                  }
                >
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start py-4 h-auto border-none"
                  >
                    <LayoutDashboard size={24} className="mr-2" />
                    <div className="hidden md:flex flex-col items-start">
                      <span className="font-medium">Overview</span>
                      <span className="text-xs text-default-500 font-medium hidden 2xl:block text-left">
                        Get an overview of your project.
                      </span>
                    </div>
                  </Button>
                </div>
              </NavLink>
              <NavLink to={`/projects/${project._id}/chat`}>
                <div
                  className={
                    isActive(`/projects/${project?._id}/chat`)
                      ? "bg-default-200 rounded-lg"
                      : ""
                  }
                >
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start py-4 h-auto border-none"
                  >
                    <MessagesSquare size={24} className="mr-2" />
                    <div className="hidden md:flex flex-col items-start">
                      <span className="font-medium">Chat</span>
                      <span className="text-xs text-default-500 font-medium hidden 2xl:block text-left">
                        Converse with members.
                      </span>
                    </div>
                  </Button>
                </div>
              </NavLink>
              <NavLink to={`/projects/${project._id}/collab`}>
                <div
                  className={
                    isActive(`/projects/${project?._id}/collab`)
                      ? "bg-default-200 rounded-lg"
                      : ""
                  }
                >
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start py-4 h-auto border-none"
                  >
                    <Presentation size={24} className="mr-2" />
                    <div className="hidden md:flex flex-col items-start">
                      <span className="font-medium">Collab</span>
                      <span className="text-xs text-default-500 font-medium hidden 2xl:block text-left">
                        Collab in real time.
                      </span>
                    </div>
                  </Button>
                </div>
              </NavLink>
              <NavLink to={`/projects/${project._id}/tasks`}>
                <div
                  className={
                    isActive(`/projects/${project?._id}/tasks`)
                      ? "bg-default-200 rounded-lg"
                      : ""
                  }
                >
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start py-4 h-auto border-none"
                  >
                    <CalendarDays size={24} className="mr-2" />
                    <div className="hidden md:flex flex-col items-start">
                      <span className="font-medium">Tasks</span>
                      <span className="text-xs text-default-500 font-medium hidden 2xl:block text-left">
                        Manage your project tasks.
                      </span>
                    </div>
                  </Button>
                </div>
              </NavLink>
              {/* <NavLink
                to={`/projects/${project._id}/posts`}
                className={({ isActive }) =>
                  isActive ? "bg-accent text-accent-foreground" : ""
                }
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start py-4 h-auto border-none"
                >
                  <ScrollText size={24} className="mr-2" />
                  <div className="hidden md:flex flex-col items-start">
                    <span className="font-medium">Posts</span>
                    <span className="text-xs text-default-500 font-medium hidden 2xl:block text-left">
                      Post anything to your team members.
                    </span>
                  </div>
                </Button>
              </NavLink> */}
              <NavLink to={`/projects/${project._id}/surveys`}>
                <div
                  className={
                    isActive(`/projects/${project?._id}/surveys`)
                      ? "bg-default-200 rounded-lg"
                      : ""
                  }
                >
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start py-4 h-auto border-none"
                  >
                    <Vote size={24} className="mr-2" />
                    <div className="hidden md:flex flex-col items-start">
                      <span className="font-medium">Survey</span>
                      <span className="text-xs text-default-500 font-medium hidden 2xl:block text-left">
                        Gauge opinions or vote on something.
                      </span>
                    </div>
                  </Button>
                </div>
              </NavLink>
              <NavLink to={`/projects/${project._id}/settings`}>
                <div
                  className={
                    isActive(`/projects/${project?._id}/settings`)
                      ? "bg-default-200 rounded-lg"
                      : ""
                  }
                >
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start py-4 h-auto border-none"
                  >
                    <Settings size={24} className="mr-2" />
                    <div className="hidden md:flex flex-col items-start">
                      <span className="font-medium">Settings</span>
                      <span className="text-xs text-default-500 font-medium hidden 2xl:block text-left">
                        Update project settings.
                      </span>
                    </div>
                  </Button>
                </div>
              </NavLink>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-center grow">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            </div>
          )}
          <div>
            <Link to={`/projects`} className="block rounded-md">
              <Button
                variant="ghost"
                className="flex w-full justify-start py-4 h-auto border-none"
              >
                <ArrowLeft size={24} className="mr-2" />
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-medium">Projects</span>
                  <span className="text-xs text-default-500 font-medium hidden 2xl:block text-left">
                    View all your projects.
                  </span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
