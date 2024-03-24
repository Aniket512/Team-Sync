import Picker from "emoji-picker-react";
import { useState } from "react";
import { SendHorizonal, Smile } from "lucide-react";

type Props = {
  handleSendMsg: (value: string) => void;
};

const ChatInput = ({ handleSendMsg }: Props) => {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (event: any) => {
    let message = msg;
    message += event.emoji;
    setMsg(message);
  };

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const sendChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
    setShowEmojiPicker(false);
  };
  return (
    <>
      <div className="flex justify-between gap-4 w-full bg-gray-100 p-3 rounded-md">
        <div className="flex items-center">
          <div className="cursor-pointer">
            <Smile onClick={handleEmojiPickerhideShow} />
            {showEmojiPicker && (
              <Picker
                width={350}
                height={400}
                onEmojiClick={handleEmojiClick}
              />
            )}
          </div>
        </div>
        <form className="flex justify-between items-center gap-4 w-full" onSubmit={(event) => sendChat(event)}>
          <input
            type="text"
            placeholder="type your message here"
            className="w-full p-2 rounded-md border-none focus:outline-none"
            onChange={(e) => setMsg(e.target.value)}
            value={msg}
            autoFocus
          />
          <button type="submit">
            <SendHorizonal />
          </button>
        </form>
      </div>
    </>
  );
};
export default ChatInput;
