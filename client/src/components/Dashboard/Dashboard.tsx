import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Users, MailWarning, Wifi } from "lucide-react";
import InviteMember from "./InviteMember";
import { useAppSelector } from "../../redux/hooks";
import { TeamMembers } from "./TeamMembers";
import { getUserId } from "../../configs/auth";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "../../api/urls";

export default function Dashboard() {
  const { currentProject } = useAppSelector((state) => state.projects);
  const [onlineCount, setOnlineCount] = useState(0);
  const [users, setUsers] = useState([]);
  const socket = io(BASE_URL);

  useEffect(() => {
    if (socket) {
      socket.on("get-users", (users) => {        
        setUsers(users);
        setOnlineCount(users?.length);
      });
    }
  }, []);

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col p-4 overflow-auto">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              {currentProject?.createdBy === getUserId() && <InviteMember />}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium">Total Members</p>

                  <Users className="h-4 w-4 text-default-500 font-bold" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">
                    {currentProject?.members.length}
                  </div>
                  <p className="text-xs text-default-500 font-semibold">
                    Members have joined.
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium">Pending Invites</p>
                  <MailWarning className="h-4 w-4 text-default-500" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">
                    {currentProject?.pendingInvites}
                  </div>
                  <p className="text-xs text-default-500 font-semibold">
                    Invites waiting for response.
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium">Online Now</p>
                  <Wifi className="h-4 w-4 text-default-500" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{onlineCount}</div>
                  <p className="text-xs text-default-500 font-semibold">
                    Members who are live
                  </p>
                </CardBody>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <div className="text-xl text-dark font-semibold">Members</div>
                </CardHeader>
                <div>
                  {currentProject && (
                    <TeamMembers project={currentProject} users={users} />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
