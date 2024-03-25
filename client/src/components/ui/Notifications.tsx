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
import axios from "axios";
import { getAccessToken, getUserId } from "../../configs/auth";
import { toast } from "react-toastify";
import {
  BASE_URL,
  getHeaders,
  getNotifications,
  markNotificationRead,
} from "../../api/urls";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

export const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationSchema[]>([]);
  const [audio] = useState(new Audio('/notification.mp3'));
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const userId = getUserId();
  const { projectId } = useParams();
  const socket = io(BASE_URL);
  
  useEffect(() => {
    if (projectId) {
      socket.emit("add-user", userId, projectId);
    }
  }, [userId, projectId]);

  useEffect(() => {
    if (socket) {
      socket.on("notification", (data) => {        
        if (
          !notifications.some(
            (notification) => notification._id === data.notification._id
          )
        ) {
          setNotifications((prevNotifications) => [
            data.notification,
            ...prevNotifications,
          ]);
          setCount((prev) => prev + 1);
          audio.play();
        }
      });
      }
  }, [socket]);

  useEffect(() => {
    axios
      .get(getNotifications(), {
        headers: {
          access_token: getAccessToken(),
        },
      })
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
    axios
      .patch(
        markNotificationRead(notification._id),
        {},
        {
          headers: getHeaders(),
        }
      )
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
