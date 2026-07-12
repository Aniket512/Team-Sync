const Message = require("../models/Message");
const User = require("../models/User");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const logger = require("../utils/logger");

/**
 * Paginated messages for chat infinite scroll.
 * - First load: omit `before` → latest page (newest messages)
 * - Scroll up: pass `before` = oldest loaded message's createdAt
 * Returns messages oldest→newest within the page for easy append/prepend.
 */
module.exports.getMessages = async (req, res) => {
  try {
    const { projectId, before, limit: rawLimit } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId is required",
      });
    }

    const limit = Math.min(Math.max(Number(rawLimit) || 30, 1), 50);
    const filter = { projectId };

    // Cursor: load messages older than the ones already on screen
    if (before) {
      const beforeDate = new Date(before);
      if (!Number.isNaN(beforeDate.getTime())) {
        filter.createdAt = { $lt: beforeDate };
      }
    }

    // Fetch one extra row to know if an older page exists
    const rows = await Message.find(filter)
      .populate("sender")
      .populate("segments.userId", "name email avatar")
      .populate("segments.taskId", "name status description")
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    // Reverse so the client can render top→bottom chronologically
    pageRows.reverse();

    const messages = pageRows.map((msg) => ({
      _id: msg._id,
      fromSelf: msg.sender._id.toString() === req.user._id.toString(),
      message: msg.message,
      sender: msg.sender,
      segments: msg.segments || [],
      createdAt: msg.createdAt,
    }));

    const nextCursor =
      messages.length > 0 ? messages[0].createdAt : null;

    return res.status(200).json({
      messages,
      hasMore,
      nextCursor,
      limit,
    });
  } catch (err) {
    logger.error("Failed to fetch messages", { message: err.message });
    return res.status(500).json({
      success: false,
      message: "Failed to get messages",
    });
  }
};

/** Escape special regex characters in a display name */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build segments from display text + explicit mention/task IDs.
 *
 * Display text uses readable tokens:
 *   "Hey @John Doe, see #Fix Login please"
 *
 * IDs come from the client (picker selections), not from fragile name-only parsing.
 * Also supports legacy "task:<mongoId>" tokens for older messages.
 */
async function buildSegments(message, mentionedUserIds = [], linkedTaskIds = []) {
  const segments = [];
  const replacements = [];
  const occupied = []; // track overlapping ranges

  const overlaps = (start, end) =>
    occupied.some(([s, e]) => start < e && end > s);

  const mark = (start, end) => occupied.push([start, end]);

  // --- Mentions: resolve by provided user IDs, match full @Name in text ---
  const userIds = Array.isArray(mentionedUserIds)
    ? mentionedUserIds.filter(Boolean)
    : [];

  if (userIds.length > 0) {
    const users = await User.find({ _id: { $in: userIds } }).select(
      "name _id"
    );
    // Longest names first so "John Doe" wins over "John"
    users.sort((a, b) => b.name.length - a.name.length);

    for (const user of users) {
      const pattern = new RegExp(
        `@${escapeRegex(user.name)}(?=\\s|$|[^\\w])`,
        "gi"
      );
      let m;
      while ((m = pattern.exec(message)) !== null) {
        if (overlaps(m.index, m.index + m[0].length)) continue;
        replacements.push({
          index: m.index,
          length: m[0].length,
          type: "mention",
          value: `@${user.name}`,
          userId: user._id,
        });
        mark(m.index, m.index + m[0].length);
      }
    }
  }

  // --- Tasks: match #Task Name from provided IDs ---
  const taskIds = Array.isArray(linkedTaskIds)
    ? [...new Set(linkedTaskIds.filter(Boolean).map(String))]
    : [];

  if (taskIds.length > 0) {
    const tasks = await Task.find({ _id: { $in: taskIds } }).select(
      "name _id"
    );
    tasks.sort((a, b) => b.name.length - a.name.length);

    for (const task of tasks) {
      const hashPattern = new RegExp(
        `#${escapeRegex(task.name)}(?=\\s|$|[^\\w])`,
        "gi"
      );
      let m;
      let matched = false;
      while ((m = hashPattern.exec(message)) !== null) {
        if (overlaps(m.index, m.index + m[0].length)) continue;
        replacements.push({
          index: m.index,
          length: m[0].length,
          type: "task",
          value: `#${task.name}`,
          taskId: task._id,
        });
        mark(m.index, m.index + m[0].length);
        matched = true;
      }

      // Legacy fallback: task:<mongoId> still in raw text
      if (!matched) {
        const legacy = new RegExp(`task:${task._id}`, "i");
        const lm = legacy.exec(message);
        if (lm && !overlaps(lm.index, lm.index + lm[0].length)) {
          replacements.push({
            index: lm.index,
            length: lm[0].length,
            type: "task",
            value: `#${task.name}`,
            taskId: task._id,
          });
          mark(lm.index, lm.index + lm[0].length);
        }
      }
    }
  }

  // Legacy task:id without being in linkedTaskIds
  const legacyAny = /task:([a-f0-9]{24})/gi;
  let lm;
  while ((lm = legacyAny.exec(message)) !== null) {
    if (overlaps(lm.index, lm.index + lm[0].length)) continue;
    const taskId = lm[1];
    const task = await Task.findById(taskId).select("name _id");
    if (!task) continue;
    replacements.push({
      index: lm.index,
      length: lm[0].length,
      type: "task",
      value: `#${task.name}`,
      taskId: task._id,
    });
    mark(lm.index, lm.index + lm[0].length);
  }

  replacements.sort((a, b) => a.index - b.index);

  let cursor = 0;
  for (const rep of replacements) {
    if (rep.index > cursor) {
      segments.push({
        type: "text",
        value: message.substring(cursor, rep.index),
      });
    }
    if (rep.type === "mention") {
      segments.push({
        type: "mention",
        value: rep.value,
        userId: rep.userId,
        taskId: null,
      });
    } else if (rep.type === "task") {
      segments.push({
        type: "task",
        value: rep.value,
        userId: null,
        taskId: rep.taskId,
      });
    }
    cursor = rep.index + rep.length;
  }

  if (cursor < message.length) {
    segments.push({
      type: "text",
      value: message.substring(cursor),
    });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", value: message });
  }

  return segments;
}

module.exports.addMessage = async (req, res) => {
  try {
    const body = req.validated || req.body;
    const { from, message, projectId, mentionedUsers, linkedTask, linkedTasks } =
      body;

    // Normalize task IDs from either linkedTasks[] or single linkedTask
    const taskIdList = [
      ...(Array.isArray(linkedTasks) ? linkedTasks : []),
      ...(linkedTask ? [linkedTask] : []),
    ].filter(Boolean);

    const mentionIds = Array.isArray(mentionedUsers) ? mentionedUsers : [];

    const segments = await buildSegments(message, mentionIds, taskIdList);

    const savedMessage = await Message.create({
      message,
      sender: from,
      projectId,
      segments,
    });

    await savedMessage.populate("sender");
    await savedMessage.populate("segments.userId", "name email avatar");
    await savedMessage.populate("segments.taskId", "name status description");

    // Persist mention notifications so they show in the bell even after refresh
    const sender = savedMessage.sender;
    const uniqueMentionIds = [
      ...new Set(
        segments
          .filter((s) => s.type === "mention" && s.userId)
          .map((s) => s.userId._id?.toString?.() || s.userId.toString())
          .filter((id) => id && id !== String(from))
      ),
    ];

    const notifications = [];
    for (const mentionedUserId of uniqueMentionIds) {
      const notification = await Notification.create({
        projectId,
        userId: mentionedUserId,
        contentId: String(savedMessage._id),
        title: `${sender.name} mentioned you in chat`,
        description: message.substring(0, 100),
        type: "info",
      });
      notifications.push(notification);
    }

    return res.status(201).json({
      message: savedMessage,
      notifications,
    });
  } catch (err) {
    logger.error("Failed to add message", { message: err.message });
    return res.status(500).json({
      success: false,
      message: "Failed to add message to the database",
    });
  }
};
