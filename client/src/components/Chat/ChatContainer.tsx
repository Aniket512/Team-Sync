import { useEffect, useRef, useState, useCallback } from "react";
import { getUserId } from "../../configs/auth";
import { useParams } from "react-router-dom";
import { Message, TypingUser } from "../../utils/types";
import { getMessagesRoute, sendMessage } from "../../api/urls";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";
import moment from "moment";
import ChatInput from "./ChatInput";
import apiClient from "../../api/apiClient";
import { useAppSelector } from "../../redux/hooks";
import { Avatar, Chip, Spinner } from "@nextui-org/react";
import { Link } from "react-router-dom";

type SendMeta = {
  mentionedUsers: string[];
  linkedTasks: string[];
};

const PAGE_SIZE = 30;

const ChatContainer = ({ socket }: { socket: Socket }) => {
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [audio] = useState(new Audio("/notification.mp3"));
  const [arrivalMessage, setArrivalMessage] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [readReceipts, setReadReceipts] = useState<Record<string, string[]>>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSocketConnected, setIsSocketConnected] = useState(socket?.connected);
  const [pendingMessages, setPendingMessages] = useState<
    { msg: string; meta: SendMeta }[]
  >([]);
  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Only auto-scroll when user is near the bottom (or on own send)
  const stickToBottomRef = useRef(true);
  const isPrependingRef = useRef(false);

  const currentUserId = getUserId();
  const { projectId } = useParams();
  const { currentProject } = useAppSelector((state) => state.projects);
  const members = currentProject?.members?.map((m) => m.user) || [];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleConnect = () => setIsSocketConnected(true);
    const handleDisconnect = () => setIsSocketConnected(false);
    socket?.on("connect", handleConnect);
    socket?.on("disconnect", handleDisconnect);
    setIsSocketConnected(socket?.connected);
    return () => {
      socket?.off("connect", handleConnect);
      socket?.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!isOnline || pendingMessages.length === 0) return;
    const queued = [...pendingMessages];
    setPendingMessages([]);
    queued.forEach(({ msg, meta }) => postMessage(msg, meta));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Initial page: latest messages
  useEffect(() => {
    if (!projectId) return;

    setMessages([]);
    setHasMore(true);
    setLoadingInitial(true);
    stickToBottomRef.current = true;

    apiClient
      .post(getMessagesRoute(), { projectId, limit: PAGE_SIZE })
      .then((res) => {
        const data = res.data;
        // Support both new paginated shape and legacy array (safety)
        const list = Array.isArray(data) ? data : data?.messages || [];
        setMessages(list);
        setHasMore(Array.isArray(data) ? false : Boolean(data?.hasMore));
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load messages");
      })
      .finally(() => setLoadingInitial(false));
  }, [projectId]);

  // Load older messages when user scrolls near the top
  const loadOlderMessages = useCallback(async () => {
    if (!projectId || !hasMore || loadingMore || loadingInitial) return;
    if (messages.length === 0) return;

    const oldest = messages[0];
    const container = scrollContainerRef.current;
    const prevHeight = container?.scrollHeight || 0;
    const prevTop = container?.scrollTop || 0;

    setLoadingMore(true);
    isPrependingRef.current = true;

    try {
      const res = await apiClient.post(getMessagesRoute(), {
        projectId,
        limit: PAGE_SIZE,
        before: oldest.createdAt,
      });
      const data = res.data;
      const older = data?.messages || [];
      setHasMore(Boolean(data?.hasMore));

      if (older.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const unique = older.filter((m: Message) => !existingIds.has(m._id));
          return [...unique, ...prev];
        });

        // Keep the viewport anchored so the user doesn't jump
        requestAnimationFrame(() => {
          if (!container) return;
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - prevHeight + prevTop;
          isPrependingRef.current = false;
        });
      } else {
        isPrependingRef.current = false;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load older messages");
      isPrependingRef.current = false;
    } finally {
      setLoadingMore(false);
    }
  }, [projectId, hasMore, loadingMore, loadingInitial, messages]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Near bottom → stick for new messages / typing
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;

    // Near top → fetch older page
    if (el.scrollTop < 80) {
      loadOlderMessages();
    }
  }, [loadOlderMessages]);

  useEffect(() => {
    const handleMsgReceive = (msg: Message) => {
      if (msg.sender?._id !== getUserId()) {
        setArrivalMessage(msg);
        audio.play().catch(() => {});
      }
    };

    socket?.on("msg-receive", handleMsgReceive);
    return () => {
      socket?.off("msg-receive", handleMsgReceive);
    };
  }, [socket, audio]);

  useEffect(() => {
    const handleTypingUpdate = (data: TypingUser) => {
      if (data.userId === currentUserId) return;
      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (prev.find((u) => u.userId === data.userId)) return prev;
          return [...prev, data];
        }
        return prev.filter((u) => u.userId !== data.userId);
      });
    };

    socket?.on("typing-update", handleTypingUpdate);
    return () => {
      socket?.off("typing-update", handleTypingUpdate);
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    const handleReadReceipt = (data: {
      messageId: string;
      userId: string;
      readAt: Date;
    }) => {
      setReadReceipts((prev) => {
        const existing = prev[data.messageId] || [];
        if (existing.includes(data.userId)) return prev;
        return { ...prev, [data.messageId]: [...existing, data.userId] };
      });
    };

    socket?.on("read-receipt", handleReadReceipt);
    return () => {
      socket?.off("read-receipt", handleReadReceipt);
    };
  }, [socket]);

  const postMessage = (msg: string, meta: SendMeta) => {
    stickToBottomRef.current = true;
    apiClient
      .post(sendMessage(), {
        from: currentUserId,
        projectId,
        message: msg,
        mentionedUsers:
          meta.mentionedUsers.length > 0 ? meta.mentionedUsers : undefined,
        linkedTask: meta.linkedTasks[0] || null,
        linkedTasks:
          meta.linkedTasks.length > 0 ? meta.linkedTasks : undefined,
      })
      .then((res) => {
        const payload = res?.data;
        const newMessage = payload?.message || payload;
        const notifications = payload?.notifications || [];

        notifications.forEach((notification: any) => {
          socket?.emit("send-notification", notification);
        });

        if (socket?.connected) {
          socket.emit("send-msg", {
            ...newMessage,
            from: currentUserId,
            projectId,
          });
        }

        setMessages((prev) => [
          ...prev,
          {
            ...newMessage,
            fromSelf: true,
          },
        ]);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to send message");
      });
  };

  const handleSendMsg = (msg: string, meta: SendMeta) => {
    if (!isOnline) {
      setPendingMessages((prev) => [...prev, { msg, meta }]);
      toast.info("Message queued — will send when you are back online");
      return;
    }
    postMessage(msg, meta);
  };

  useEffect(() => {
    if (!arrivalMessage) return;
    setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  // Auto-scroll only when stuck to bottom and not prepending older history
  useEffect(() => {
    if (isPrependingRef.current) return;
    if (!stickToBottomRef.current) return;
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const renderMessage = (message: any) => {
    if (!message) return null;
    const segments = message.segments || [];

    if (segments.length === 0) {
      return <span>{message.message}</span>;
    }

    return segments.map((seg: any, idx: number) => {
      if (seg.type === "text") {
        return <span key={idx}>{seg.value}</span>;
      }

      if (seg.type === "mention") {
        const displayName = seg.userId?.name
          ? `@${seg.userId.name}`
          : seg.value;
        const isMentioned = Boolean(seg.userId?._id || seg.userId);

        return (
          <span
            key={idx}
            className={`font-semibold ${
              isMentioned
                ? "text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/40 px-1 rounded"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {displayName}
          </span>
        );
      }

      if (seg.type === "task") {
        const task = seg.taskId;
        if (task && typeof task === "object" && task._id) {
          return (
            <Link
              key={idx}
              to={`/projects/${projectId}/tasks/${task._id}`}
              className="inline-block mx-1 align-middle"
            >
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2 hover:shadow-md transition-shadow min-w-[180px]">
                <div className="flex items-center gap-1 mb-0.5">
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="text-[10px] h-5"
                  >
                    Task
                  </Chip>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                    {task.name}
                  </span>
                </div>
                <Chip
                  size="sm"
                  color={
                    task.status === "done"
                      ? "success"
                      : task.status === "in_progress"
                        ? "primary"
                        : task.status === "in_review"
                          ? "warning"
                          : "default"
                  }
                  variant="flat"
                  className="text-[10px] h-5"
                >
                  {task.status?.replace("_", " ") || "backlog"}
                </Chip>
              </div>
            </Link>
          );
        }

        return (
          <span
            key={idx}
            className="text-orange-600 dark:text-orange-400 font-medium mx-0.5"
          >
            {seg.value?.startsWith("#") ? seg.value : `#${seg.value || "task"}`}
          </span>
        );
      }

      return <span key={idx}>{seg.value}</span>;
    });
  };

  const typingText =
    typingUsers.length > 0
      ? typingUsers.length === 1
        ? `${typingUsers[0].name} is typing...`
        : `${typingUsers.length} people are typing...`
      : "";

  return (
    <div className="w-full m-2 flex flex-col min-h-0 h-full">
      {(!isOnline || !isSocketConnected) && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4 rounded-md mb-2 text-sm font-medium animate-pulse">
          {!isOnline
            ? "You are offline. Messages will be sent when you reconnect."
            : "Reconnecting to server..."}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-col grow overflow-y-auto scrollbar pr-2 min-h-0"
      >
        {/* Top of history */}
        <div className="flex justify-center py-2 min-h-[28px]">
          {loadingMore && <Spinner size="sm" color="warning" />}
          {!hasMore && messages.length > 0 && !loadingInitial && (
            <span className="text-[11px] text-default-400">
              Beginning of conversation
            </span>
          )}
        </div>

        {loadingInitial ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Spinner size="lg" color="warning" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-default-400">
              No messages yet — say hello to the team
            </p>
          </div>
        ) : (
          messages.map((message, idx) => {
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
              <div key={message._id || idx}>
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
                  {!message.fromSelf && (
                    <div className="flex items-end mr-2">
                      <Avatar
                        src={message.sender?.avatar || ""}
                        name={
                          message.sender?.name?.charAt(0)?.toUpperCase() || "?"
                        }
                        className="w-8 h-8 rounded-full"
                        size="sm"
                      />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl relative group max-w-[75%] ${
                      message.fromSelf
                        ? "bg-orange-500 text-white dark:bg-orange-600"
                        : "bg-white border border-gray-200 text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold mb-1 ${
                        message.fromSelf
                          ? "text-orange-100"
                          : "text-gray-500 dark:text-zinc-400"
                      }`}
                    >
                      {message.sender?.name}
                    </div>

                    <div className="text-sm break-words pr-12">
                      {renderMessage(message)}
                    </div>

                    <div
                      className={`absolute bottom-2 right-3 text-[11px] ${
                        message.fromSelf
                          ? "text-orange-100/80"
                          : "text-gray-400 dark:text-zinc-500"
                      }`}
                    >
                      {moment(message.createdAt).format("HH:mm")}
                      {message.fromSelf && readReceipts[message._id] && (
                        <span className="ml-1 text-[10px] text-green-300">
                          ✓✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {typingText && (
          <div className="flex items-center gap-2 mb-2 ml-2">
            <div className="flex -space-x-1">
              {typingUsers.slice(0, 3).map((user) => (
                <Avatar
                  key={user.userId}
                  name={user.name.charAt(0).toUpperCase()}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                  size="sm"
                />
              ))}
            </div>
            <div className="bg-gray-100 dark:bg-zinc-700 rounded-full px-4 py-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                  {typingText}
                </span>
                <span className="flex gap-0.5">
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>
      <ChatInput handleSendMsg={handleSendMsg} members={members} />
    </div>
  );
};

export default ChatContainer;
