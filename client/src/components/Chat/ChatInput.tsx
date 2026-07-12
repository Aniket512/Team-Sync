import Picker, { Theme } from "emoji-picker-react";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { SendHorizonal, Smile, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { socket } from "../../configs/SocketProvider";
import { getUserId, getUserName } from "../../configs/auth";
import { useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { getTasks } from "../../api/urls";

type Member = { _id: string; name: string; avatar?: string };

type Props = {
  handleSendMsg: (
    value: string,
    meta: { mentionedUsers: string[]; linkedTasks: string[] }
  ) => void;
  members?: Member[];
};

type MentionRef = { userId: string; name: string };
type TaskRef = { taskId: string; name: string };

type HighlightPart = {
  type: "text" | "mention" | "task";
  value: string;
};

/** Escape text for safe HTML highlight backdrop */
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Split the draft into plain text / @mention / #task parts
 * using the refs selected from the pickers (longest names first).
 */
function buildHighlightParts(
  text: string,
  mentionRefs: MentionRef[],
  taskRefs: TaskRef[]
): HighlightPart[] {
  if (!text) return [{ type: "text", value: "" }];

  type Hit = { start: number; end: number; type: "mention" | "task"; value: string };
  const hits: Hit[] = [];

  const mentions = [...mentionRefs].sort(
    (a, b) => b.name.length - a.name.length
  );
  const tasks = [...taskRefs].sort((a, b) => b.name.length - a.name.length);

  for (const m of mentions) {
    const token = `@${m.name}`;
    let from = 0;
    while (from < text.length) {
      const idx = text.indexOf(token, from);
      if (idx === -1) break;
      const end = idx + token.length;
      const overlaps = hits.some((h) => idx < h.end && end > h.start);
      if (!overlaps) hits.push({ start: idx, end, type: "mention", value: token });
      from = end;
    }
  }

  for (const t of tasks) {
    const token = `#${t.name}`;
    let from = 0;
    while (from < text.length) {
      const idx = text.indexOf(token, from);
      if (idx === -1) break;
      const end = idx + token.length;
      const overlaps = hits.some((h) => idx < h.end && end > h.start);
      if (!overlaps) hits.push({ start: idx, end, type: "task", value: token });
      from = end;
    }
  }

  hits.sort((a, b) => a.start - b.start);

  const parts: HighlightPart[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start > cursor) {
      parts.push({ type: "text", value: text.slice(cursor, hit.start) });
    }
    parts.push({ type: hit.type, value: hit.value });
    cursor = hit.end;
  }
  if (cursor < text.length) {
    parts.push({ type: "text", value: text.slice(cursor) });
  }
  if (parts.length === 0) {
    parts.push({ type: "text", value: text });
  }
  return parts;
}

const ChatInput = ({ handleSendMsg, members = [] }: Props) => {
  const { resolvedTheme } = useTheme();
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [showTaskEmbed, setShowTaskEmbed] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [mentionRefs, setMentionRefs] = useState<MentionRef[]>([]);
  const [taskRefs, setTaskRefs] = useState<TaskRef[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = getUserId();
  const userName = getUserName();
  const { projectId } = useParams();

  // Load project tasks once per project
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    setTasksLoaded(false);
    setAllTasks([]);
    setLoadingTasks(true);

    apiClient
      .get(getTasks(projectId))
      .then((res) => {
        if (cancelled) return;
        setAllTasks(res.data || []);
        setTasksLoaded(true);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingTasks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleTyping = useCallback(() => {
    if (!projectId) return;
    socket.emit("typing-start", { projectId, userId, name: userName });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { projectId, userId });
    }, 2000);
  }, [projectId, userId, userName]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (projectId) {
        socket.emit("typing-stop", { projectId, userId });
      }
    };
  }, [projectId, userId]);

  const highlightParts = useMemo(
    () => buildHighlightParts(msg, mentionRefs, taskRefs),
    [msg, mentionRefs, taskRefs]
  );

  const handleEmojiClick = (event: any) => {
    setMsg((prev) => prev + event.emoji);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const pos = e.target.selectionStart || 0;
    setMsg(value);
    setCursorPos(pos);
    handleTyping();

    // Drop refs that the user deleted from the text
    setMentionRefs((prev) => prev.filter((m) => value.includes(`@${m.name}`)));
    setTaskRefs((prev) => prev.filter((t) => value.includes(`#${t.name}`)));

    const textBeforeCursor = value.substring(0, pos);

    const atMatch = textBeforeCursor.match(/(?:^|\s)@([\w\s]*)$/);
    if (atMatch) {
      setMentionSearch(atMatch[1].toLowerCase());
      setShowMentionDropdown(true);
      setShowTaskEmbed(false);
    } else {
      setShowMentionDropdown(false);
    }

    const taskMatch = textBeforeCursor.match(/(?:^|\s)\/task(?:\s+(.*))?$/i);
    if (taskMatch) {
      const query = (taskMatch[1] || "").trim();
      setTaskSearch(query);
      setShowTaskEmbed(true);
      setShowMentionDropdown(false);
    } else {
      setShowTaskEmbed(false);
    }
  };

  const insertMention = (member: Member) => {
    const textBeforeCursor = msg.substring(0, cursorPos);
    const textAfterCursor = msg.substring(cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");
    if (atIndex < 0) return;

    const token = `@${member.name} `;
    const newMsg =
      textBeforeCursor.substring(0, atIndex) + token + textAfterCursor;

    setMsg(newMsg);
    setMentionRefs((prev) => {
      if (prev.some((m) => m.userId === member._id)) return prev;
      return [...prev, { userId: member._id, name: member.name }];
    });
    setShowMentionDropdown(false);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const pos = atIndex + token.length;
      inputRef.current?.setSelectionRange(pos, pos);
      setCursorPos(pos);
    });
  };

  const insertTaskEmbed = (task: any) => {
    const textBeforeCursor = msg.substring(0, cursorPos);
    const textAfterCursor = msg.substring(cursorPos);
    const slashMatch = textBeforeCursor.match(
      /(?:^|\s)(\/task(?:\s+.*)?)$/i
    );
    let replaceStart = -1;
    if (slashMatch && slashMatch[1]) {
      replaceStart = textBeforeCursor.length - slashMatch[1].length;
    } else {
      replaceStart = textBeforeCursor.toLowerCase().lastIndexOf("/task");
    }

    if (replaceStart < 0) return;

    const token = `#${task.name} `;
    const newMsg =
      textBeforeCursor.substring(0, replaceStart) + token + textAfterCursor;

    setMsg(newMsg);
    setTaskRefs((prev) => {
      if (prev.some((t) => t.taskId === task._id)) return prev;
      return [...prev, { taskId: task._id, name: task.name }];
    });
    setShowTaskEmbed(false);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const pos = replaceStart + token.length;
      inputRef.current?.setSelectionRange(pos, pos);
      setCursorPos(pos);
    });
  };

  const sendChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (msg.trim().length === 0) return;

    const activeMentions = mentionRefs.filter((m) =>
      msg.includes(`@${m.name}`)
    );
    const activeTasks = taskRefs.filter((t) => msg.includes(`#${t.name}`));

    handleSendMsg(msg, {
      mentionedUsers: activeMentions.map((m) => m.userId),
      linkedTasks: activeTasks.map((t) => t.taskId),
    });

    setMsg("");
    setMentionRefs([]);
    setTaskRefs([]);
    setShowMentionDropdown(false);
    setShowTaskEmbed(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (projectId) {
      socket.emit("typing-stop", { projectId, userId });
    }
    setShowEmojiPicker(false);
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(mentionSearch.trim())
  );

  const availableTasks =
    taskSearch.length > 0
      ? allTasks
          .filter((t: any) =>
            t.name.toLowerCase().includes(taskSearch.toLowerCase())
          )
          .slice(0, 8)
      : allTasks.slice(0, 8);

  return (
    <>
      <div className="relative flex flex-col">
        {showMentionDropdown && filteredMembers.length > 0 && (
          <div className="absolute bottom-full mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                onClick={() => insertMention(member)}
              >
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white font-medium">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {member.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {showTaskEmbed && (
          <div className="absolute bottom-full mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase">
              Link a Task
            </div>
            {loadingTasks && !tasksLoaded ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : availableTasks.length > 0 ? (
              availableTasks.map((task) => (
                <div
                  key={task._id}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                  onClick={() => insertTaskEmbed(task)}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {task.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {task.status || "backlog"}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {taskSearch.length > 0
                  ? "No tasks found"
                  : "No tasks in this project"}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between gap-4 w-full bg-gray-100 dark:bg-default-100 p-3 rounded-md border border-transparent dark:border-default-200">
          <div className="flex items-center relative">
            <div className="cursor-pointer text-default-600 dark:text-white-400">
              <Smile onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
              {showEmojiPicker && (
                <Picker
                  width={350}
                  height={400}
                  theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
                  onEmojiClick={handleEmojiClick}
                />
              )}
            </div>
          </div>
          <form
            className="flex justify-between items-center gap-4 w-full"
            onSubmit={(event) => sendChat(event)}
          >
            {/* Highlighted draft: backdrop shows colors; input is transparent caret */}
            <div className="relative w-full">
              <div
                ref={highlightRef}
                aria-hidden
                className="absolute inset-0 p-2 pointer-events-none overflow-hidden whitespace-pre text-sm leading-normal"
              >
                {msg.length === 0 ? (
                  <span className="text-default-400">
                    Type a message... @mention or /task to link
                  </span>
                ) : (
                  highlightParts.map((part, i) => {
                    if (part.type === "mention") {
                      return (
                        <span
                          key={i}
                          className="rounded px-0.5 font-semibold text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50"
                          dangerouslySetInnerHTML={{
                            __html: escapeHtml(part.value),
                          }}
                        />
                      );
                    }
                    if (part.type === "task") {
                      return (
                        <span
                          key={i}
                          className="rounded px-0.5 font-semibold text-orange-700 bg-orange-100 dark:text-orange-200 dark:bg-orange-900/50"
                          dangerouslySetInnerHTML={{
                            __html: escapeHtml(part.value),
                          }}
                        />
                      );
                    }
                    return (
                      <span
                        key={i}
                        className="text-default-900 dark:text-white-100"
                        dangerouslySetInnerHTML={{
                          __html: escapeHtml(part.value),
                        }}
                      />
                    );
                  })
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                className="relative w-full p-2 rounded-md border-none bg-transparent text-transparent caret-black dark:caret-white placeholder:text-transparent focus:outline-none text-sm leading-normal"
                onChange={handleChange}
                value={msg}
                autoFocus
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              className="text-default-600 dark:text-default-400 hover:text-primary transition-colors shrink-0"
            >
              <SendHorizonal />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
export default ChatInput;
