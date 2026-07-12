import ChatContainer from "../components/Chat/ChatContainer";
import { socket } from "../configs/SocketProvider";

const Chat = () => {
  return (
    <div className="flex h-[calc(100vh-4.5rem)] min-h-0">
      <ChatContainer socket={socket} />
    </div>
  );
};

export default Chat;
