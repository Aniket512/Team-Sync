import {
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import { Bell } from "lucide-react";
import React, { useEffect, useState } from "react";
import { NotificationSchema } from "../../utils/types";
import { toast } from "react-toastify";
import {
  getNotifications,
  markNotificationRead,
} from "../../api/urls";
import apiClient from "../../api/apiClient";
import { useNavigate } from "react-router-dom";
import { socket } from "../../configs/SocketProvider";

export const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationSchema[]>([]);
  const [audio] = useState(new Audio('/notification.mp3'));
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNotification = (data: any) => {
      setNotifications((prevNotifications) => {
        if (
          prevNotifications.some(
            (notification) => notification._id === data.notification._id
          )
        ) {
          return prevNotifications;
        }

        audio.play();
        setCount((prev) => prev + 1);
        return [data.notification, ...prevNotifications];
      });
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [audio]);

  useEffect(() => {
    apiClient
      .get(getNotifications())
      .then((res) => {
        setNotifications(res?.data);
        setCount(res?.data?.length);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message || err.message);
      });
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLLIElement>,
    notification: NotificationSchema
  ) => {
    e.preventDefault();
    apiClient
      .patch(markNotificationRead(notification._id), {})
      .then((res) => {
        setCount((prev) => prev - 1);
        const updatedNotifications = notifications.filter(
          (not) => not._id !== notification._id
        );
        setNotifications(updatedNotifications);
        if (notification.type === "team_invitation") {
          navigate(`/invitations`);
        }
        if (notification.type === "survey") {
          navigate(
            `/projects/${notification.projectId}/surveys/${notification.contentId}`
          );
        }
        if (notification.type === "task_assignment") {
          navigate(
            `/projects/${notification.projectId}/tasks/${notification.contentId}`
          );
        }
        // Chat @mention (and other info) notifications open the project chat
        if (notification.type === "info" && notification.projectId) {
          navigate(`/projects/${notification.projectId}/chat`);
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
        <div className="mr-2 mt-3 cursor-pointer">
          <Badge content={count > 0 ? count : ""}>
            <Bell />
          </Badge>
        </div>
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
