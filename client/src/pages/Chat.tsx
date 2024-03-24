import { useEffect } from "react";
import { io } from "socket.io-client";
import { getUserId } from "../configs/auth";
import ChatContainer from "../components/ChatContainer";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../api/urls";

const Chat = () => {
  const userId = getUserId();
  const { projectId } = useParams();
  const socket = io(BASE_URL);
  
  useEffect(() => {
    if(projectId){
      socket.emit("add-user", userId, projectId);
    }
  }, [userId, projectId]);

  return (
    <div className="flex h-[90vh]">
      <ChatContainer socket={socket} />
    </div>
  );
};

export default Chat;
