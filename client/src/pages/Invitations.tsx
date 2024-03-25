import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { MyButton } from "../components/ui/MyButton";
import { getUserId } from "../configs/auth";
import { getHeaders, getInvitations, handleInvitation } from "../api/urls";
import { InvitationSchema } from "../utils/types";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import { UserNav } from "../components/ui/UserNav";
import { Notifications } from "../components/ui/Notifications";
import { socket } from "../configs/SocketProvider";

export default function Invitations() {
  const [invitations, setInvitations] = useState<InvitationSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = getUserId();

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(getInvitations(), {
        headers: getHeaders(),
      })
      .then((res) => {
        setInvitations(res?.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  const handleAction = (
    e: React.MouseEvent<HTMLButtonElement>,
    decision: string,
    invitation: InvitationSchema
  ) => {
    setIsLoading(true);
    axios
      .patch(
        handleInvitation(invitation._id),
        { decision },
        {
          headers: getHeaders(),
        }
      )
      .then((res) => {
        toast.success(res?.data?.message);
        const updatedInvitations = invitations.filter(
          (inv) => inv._id !== invitation._id
        );
        setInvitations(updatedInvitations);
        socket.emit("send-notification", res?.data?.notification);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="mx-4">
      <header className="px-3 py-1 border-b border-border h-[4.5rem] flex items-center">
        <div className="ml-auto flex items-center gap-2">
          <Notifications />
          <UserNav />
          <ThemeSwitcher />
        </div>
      </header>
      <p className="text-xl font-semibold mt-2">Invitations</p>
      <div className="flex flex-wrap mt-2 gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : invitations.length > 0 ? (
          invitations.map((invitation) => {
            return (
              <Card key={invitation._id} className="min-h-[180px]">
                <CardHeader>
                  <h4 className="text-lg font-semibold">Project Invitation</h4>
                </CardHeader>
                <CardBody>
                  <p className="text-md font-medium">
                    You have been invited to join the &quot;
                    {invitation.projectId.name}
                    &quot; project.
                  </p>
                </CardBody>
                <CardFooter className="flex justify-end gap-2">
                  <MyButton
                    color="slate"
                    variant="bordered"
                    onClick={(e) => handleAction(e, "reject", invitation)}
                  >
                    Deny
                  </MyButton>
                  <MyButton
                    color="slate"
                    onClick={(e) => handleAction(e, "accept", invitation)}
                  >
                    Accept
                  </MyButton>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <p>You do not have any pending invitations</p>
        )}
      </div>
    </div>
  );
}
