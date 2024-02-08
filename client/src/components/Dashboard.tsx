import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Plus, Users, Loader2, MailWarning, Wifi } from "lucide-react";
import InviteMember from "./ui/InviteMember";
import { useAppSelector } from "../redux/hooks";
import { TeamMembers } from "./TeamMembers";
import { getUserId } from "../configs/auth";

export default function Dashboard() {
  const { currentProject } = useAppSelector((state) => state.projects);
  
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
                  <div className="text-2xl font-bold">
                    {/* {
                      members?.filter(
                        (m) =>
                          m.isConnected &&
                          !!community?.members.find(
                            (cm) => cm.id === m.profileData?.id
                          )
                      ).length
                    } */}
                    3
                  </div>
                  <p className="text-xs text-default-500 font-semibold">
                    Members who are live
                  </p>
                </CardBody>
              </Card>
              {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Now
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card> */}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <div className="text-xl text-dark font-semibold">Members</div>
                </CardHeader>
                <p>
                  {currentProject && <TeamMembers project={currentProject} />}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
