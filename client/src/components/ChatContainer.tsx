import { useRef } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { getUserId } from "../configs/auth";
import { useParams } from "react-router-dom";
import { Message } from "../utils/types";
import {
  BASE_URL,
  getHeaders,
  getMessagesRoute,
  sendMessage,
} from "../api/urls";
import { toast } from "react-toastify";
import { Socket, io } from "socket.io-client";
import ChatInput from "./ChatInput";
import moment from "moment";

const ChatContainer = ({ socket }: { socket: Socket }) => {
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [arrivalMessage, setArrivalMessage] = useState<Message | null>(null);
  const currentUserId = getUserId();
  const { projectId } = useParams();

  useEffect(() => {
    function getMessages() {
      axios
        .post(
          getMessagesRoute(),
          {
            projectId,
          },
          {
            headers: getHeaders(),
          }
        )
        .then((res) => {
          setMessages(res.data);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.response.data.message);
        });
    }
    getMessages();
  }, []);

  const handleSendMsg = (msg: string) => {
    axios
      .post(
        sendMessage(),
        {
          from: currentUserId,
          projectId,
          message: msg,
        },
        {
          headers: getHeaders(),
        }
      )
      .then((res) => {
        const newMessage = res?.data;
        if (socket) {
          socket.emit("send-msg", {
            ...newMessage,
            from: currentUserId,
            projectId,
          });
          const msgs = [...messages];
          msgs.push({
            ...newMessage,
            fromSelf: true,
          });
          setMessages(msgs);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      });
  };

  socket?.on("msg-receive", (msg: Message) => {
    if (msg.sender._id !== getUserId()) {
      setArrivalMessage(msg);
    }
  });

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="w-full m-2 flex flex-col">
      <div className="flex flex-col grow overflow-y-auto scrollbar pr-2">
        {messages.map((message, idx) => {
          const messageDay = moment(message.createdAt);
          const isFirstOfDay =
            idx === 0 ||
            !messageDay.isSame(messages[idx - 1]?.createdAt, "day");

          const isToday = messageDay.isSame(moment(), "day");
          const isYesterday = messageDay.isSame(
            moment().subtract(1, "day"),
            "day"
          );
          return (
            <div key={message._id}>
              {isFirstOfDay && (
                <div className="flex justify-center mb-4">
                  <div className="bg-default-300 shadow-sm px-4 py-1 rounded-sm text-xs">
                    {isToday
                      ? "Today"
                      : isYesterday
                      ? "Yesterday"
                      : moment(message.createdAt).format("DD MMM, YYYY")}
                  </div>
                </div>
              )}
              <div
                className={`mb-2 flex ${
                  message.fromSelf ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-md relative group ${
                    message.fromSelf ? "bg-orange-100" : "bg-gray-100"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {message.sender.name}
                  </div>
                  <div className="text-sm pr-10">{message.message}</div>
                  <div className="text-xs text-gray-500 absolute bottom-1 right-2">
                    {moment(message.createdAt).format("HH:mm")}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} className="scrollbar" />
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </div>
  );
};

export default ChatContainer;
