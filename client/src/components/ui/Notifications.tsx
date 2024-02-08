// import {
//   Badge,
//   Button,
//   Divider,
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
//   ScrollShadow,
// } from "@nextui-org/react";
// import { Bell } from "lucide-react";
// import { useState } from "react";

// export default function Notifications() {

//   return (
//     <Popover placement="bottom">
//       <PopoverTrigger>
//         <Button radius="full" isIconOnly variant="light">
//           <Badge content="9" shape="circle" size="md" color="danger">
//             <Bell size={24} />
//           </Badge>
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent>
//         {notifications.map((notification) => {
//           return (
//             <div
//               key={notification.id}
//               className="px-1 py-2 border-solid border-gray-200"
//             >
//               <div className="text-tiny">{notification.title}</div>
//             </div>
//           );
//         })}
//       </PopoverContent>
//     </Popover>
//   );
// }

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  NavbarItem,
} from "@nextui-org/react";
import { Bell } from "lucide-react";
import React, { useEffect, useState } from "react";
import { NotificationSchema } from "../../utils/types";
import axios from "axios";
import { getAccessToken } from "../../configs/auth";
import { toast } from "react-toastify";
import { getHeaders, getNotifications, markNotificationRead } from "../../api/urls";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationSchema[]>([]);
  const navigate = useNavigate();

  // const socket = io('http://localhost:5000');

  useEffect(() => {
    axios
      .get(getNotifications(), {
        headers: {
          access_token: getAccessToken(),
        },
      })
      .then((res) => {
        setNotifications(res?.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      });
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLLIElement>,
    notification: NotificationSchema
  ) => {
    e.preventDefault();
    axios
      .patch(
        markNotificationRead(notification._id),
        {},
        {
          headers: getHeaders(),
        }
      )
      .then((res) => {
        const updatedNotifications = notifications.filter(
          (not) => not._id !== notification._id
        );
        setNotifications(updatedNotifications);
        if (notification.type === "team_invitation") {
          navigate(`/invitations`);
        }
        if (notification.type === "survey") {
          navigate(`/projects/${notification.projectId}/surveys/${notification.contentId}`);
        }
        if (notification.type === "task_assignment") {
          navigate(`/projects/${notification.projectId}/tasks/${notification.contentId}`);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      });
  };
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Bell />
      </DropdownTrigger>
      <DropdownMenu className="" aria-label="Avatar Actions">
        <DropdownSection title="Notifications">
          {notifications.map((notification) => {
            return (
              <DropdownItem
                classNames={{
                  base: "py-2",
                  title: "text-sm font-semibold",
                }}
                key={notification._id}
                description={notification?.description}
                onClick={(e) => handleClick(e, notification)}
                closeOnSelect={false}
              >
                {notification.title}
              </DropdownItem>
            );
          })}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
