const { Server } = require("socket.io");
const Redis = require("ioredis");
const { createAdapter } = require("@socket.io/redis-adapter");
const logger = require("./utils/logger");
const Excalidraw = require("./models/Excalidraw");

const createSocketServer = async (server, clientOrigin, redisUrl) => {
  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
      transports: ["websocket", "polling"],
      methods: ["GET", "POST"],
    },
    // Detect dead connections so presence can be cleaned up
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  const useRedis = Boolean(redisUrl);
  const redisClient = useRedis ? new Redis(redisUrl, { lazyConnect: true }) : null;
  const pubClient = useRedis ? redisClient.duplicate({ lazyConnect: true }) : null;
  const subClient = useRedis ? redisClient.duplicate({ lazyConnect: true }) : null;

  // Local fallback maps when Redis is not configured
  const localUserSockets = new Map(); // userId -> Set(socketId)
  const localSocketMeta = new Map(); // socketId -> { userId, projectId }

  const isRedisReady = () => useRedis && redisClient?.status === "ready";

  const initializeRedisAdapter = async () => {
    if (!useRedis) {
      logger.warn("REDIS_URL not configured: socket scaling disabled.");
      return;
    }

    try {
      await Promise.all([
        redisClient.connect(),
        pubClient.connect(),
        subClient.connect(),
      ]);
      io.adapter(createAdapter(pubClient, subClient));
      logger.info("Socket.io Redis adapter enabled.");
    } catch (error) {
      logger.error("Socket.io Redis adapter failed", { message: error.message });
    }
  };

  /** True if this process still has an active socket with that id */
  const isSocketAlive = (socketId) => Boolean(io.sockets.sockets.get(socketId));

  /**
   * Return online users for a project.
   * Prunes socket ids with no meta (disconnect was missed) so ghosts disappear.
   */
  const getProjectUsers = async (projectId) => {
    if (isRedisReady()) {
      const userIds = await redisClient.smembers(`projectUsers:${projectId}`);
      const online = [];

      for (const userId of userIds) {
        const socketIds = await redisClient.smembers(
          `projectUserSockets:${projectId}:${userId}`
        );
        let aliveCount = 0;

        for (const socketId of socketIds) {
          const meta = await redisClient.get(`socketMeta:${socketId}`);
          // Drop entries whose meta was already cleared (missed disconnect)
          if (!meta) {
            await redisClient.srem(
              `projectUserSockets:${projectId}:${userId}`,
              socketId
            );
            await redisClient.srem(`userSockets:${userId}`, socketId);
            continue;
          }

          // If this process owns the socket and it is gone, clean it up now
          if (localSocketMeta.has(socketId) && !isSocketAlive(socketId)) {
            try {
              const parsed = JSON.parse(meta);
              await Promise.all([
                redisClient.srem(`userSockets:${parsed.userId}`, socketId),
                redisClient.srem(
                  `projectUserSockets:${parsed.projectId}:${parsed.userId}`,
                  socketId
                ),
                redisClient.del(`socketMeta:${socketId}`),
              ]);
            } catch (_) {
              await redisClient.del(`socketMeta:${socketId}`);
            }
            localSocketMeta.delete(socketId);
            continue;
          }

          aliveCount += 1;
        }

        if (aliveCount === 0) {
          await redisClient.srem(`projectUsers:${projectId}`, userId);
        } else {
          online.push({
            userId: String(userId),
            projectId: String(projectId),
          });
        }
      }

      return online;
    }

    // Local (no Redis): only count sockets that are still connected
    const users = [];
    const seen = new Set();

    for (const [socketId, meta] of [...localSocketMeta.entries()]) {
      if (!isSocketAlive(socketId)) {
        localSocketMeta.delete(socketId);
        const set = localUserSockets.get(meta.userId);
        if (set) {
          set.delete(socketId);
          if (set.size === 0) localUserSockets.delete(meta.userId);
        }
        continue;
      }
      if (meta.projectId === projectId && !seen.has(meta.userId)) {
        seen.add(meta.userId);
        users.push({
          userId: String(meta.userId),
          projectId: String(meta.projectId),
        });
      }
    }

    return users;
  };

  const addSocketToUser = async (userId, socketId, projectId) => {
    const uid = String(userId);
    const pid = String(projectId);

    if (isRedisReady()) {
      await Promise.all([
        redisClient.sadd(`userSockets:${uid}`, socketId),
        redisClient.sadd(`projectUserSockets:${pid}:${uid}`, socketId),
        redisClient.sadd(`projectUsers:${pid}`, uid),
        redisClient.set(
          `socketMeta:${socketId}`,
          JSON.stringify({ userId: uid, projectId: pid })
        ),
      ]);
      return;
    }

    const socketSet = localUserSockets.get(uid) || new Set();
    socketSet.add(socketId);
    localUserSockets.set(uid, socketSet);
    localSocketMeta.set(socketId, { userId: uid, projectId: pid });
  };

  const removeSocketFromUser = async (socketId) => {
    if (isRedisReady()) {
      const metaString = await redisClient.get(`socketMeta:${socketId}`);
      if (!metaString) {
        // Also clear any local leftover
        const local = localSocketMeta.get(socketId);
        if (local) {
          localSocketMeta.delete(socketId);
          return local;
        }
        return null;
      }

      const { userId, projectId } = JSON.parse(metaString);
      await Promise.all([
        redisClient.srem(`userSockets:${userId}`, socketId),
        redisClient.srem(`projectUserSockets:${projectId}:${userId}`, socketId),
        redisClient.del(`socketMeta:${socketId}`),
      ]);

      const remainingSockets = await redisClient.scard(
        `projectUserSockets:${projectId}:${userId}`
      );
      if (remainingSockets === 0) {
        await redisClient.srem(`projectUsers:${projectId}`, userId);
      }

      localSocketMeta.delete(socketId);
      return { userId, projectId };
    }

    const meta = localSocketMeta.get(socketId);
    if (!meta) return null;

    const { userId, projectId } = meta;
    const socketSet = localUserSockets.get(userId);
    if (socketSet) {
      socketSet.delete(socketId);
      if (socketSet.size === 0) {
        localUserSockets.delete(userId);
      } else {
        localUserSockets.set(userId, socketSet);
      }
    }

    localSocketMeta.delete(socketId);
    return { userId, projectId };
  };

  const emitNotificationToUser = async (notification) => {
    if (!notification?.userId) return;
    const targetUserId = String(notification.userId);

    if (isRedisReady()) {
      const socketIds = await redisClient.smembers(`userSockets:${targetUserId}`);
      for (const socketId of socketIds) {
        io.to(socketId).emit("notification", { notification });
      }
      return;
    }

    const socketSet = localUserSockets.get(targetUserId);
    if (!socketSet) return;

    for (const socketId of socketSet) {
      io.to(socketId).emit("notification", { notification });
    }
  };

  const broadcastPresence = async (projectId) => {
    if (!projectId) return;
    const projectUsers = await getProjectUsers(projectId);
    io.to(projectId).emit("get-users", projectUsers);
  };

  io.on("connection", (socket) => {
    // Join presence for a project. Re-joining after reconnect or project switch is safe.
    socket.on("add-user", async (userId, projectId) => {
      if (!userId || !projectId) return;

      const uid = String(userId);
      const pid = String(projectId);

      // Leave previous project presence if this socket was elsewhere
      const previous = await removeSocketFromUser(socket.id);
      if (previous?.projectId && previous.projectId !== pid) {
        socket.leave(previous.projectId);
        await broadcastPresence(previous.projectId);
      }

      socket.join(pid);
      await addSocketToUser(uid, socket.id, pid);
      await broadcastPresence(pid);
    });

    // Explicit leave — useful when navigating away from a project
    socket.on("leave-user", async () => {
      const meta = await removeSocketFromUser(socket.id);
      if (!meta) return;
      socket.leave(meta.projectId);
      await broadcastPresence(meta.projectId);
    });

    // Client can request a fresh presence snapshot
    socket.on("request-users", async (projectId) => {
      if (!projectId) return;
      const projectUsers = await getProjectUsers(String(projectId));
      socket.emit("get-users", projectUsers);
    });

    // === CHAT: Typing Indicators ===
    socket.on("typing-start", (data) => {
      if (!data?.projectId || !data?.userId || !data?.name) return;
      socket.to(data.projectId).emit("typing-update", {
        userId: data.userId,
        name: data.name,
        isTyping: true,
      });
    });

    socket.on("typing-stop", (data) => {
      if (!data?.projectId || !data?.userId) return;
      socket.to(data.projectId).emit("typing-update", {
        userId: data.userId,
        name: data.name,
        isTyping: false,
      });
    });

    // === CHAT: Read Receipts ===
    socket.on("mark-read", (data) => {
      if (!data?.projectId || !data?.messageId || !data?.userId) return;
      socket.to(data.projectId).emit("read-receipt", {
        messageId: data.messageId,
        userId: data.userId,
        readAt: new Date(),
      });
    });

    socket.on("send-msg", (data) => {
      if (!data?.projectId) return;
      socket.to(data.projectId).emit("msg-receive", data);
    });

    socket.on("answer-survey", (data) => {
      if (!data?.projectId) return;
      socket.to(data.projectId).emit("survey-answer-receive", data);
    });

    socket.on("send-notification", async (notification) => {
      await emitNotificationToUser(notification);
    });

    socket.on("join-room", async (projectId) => {
      if (!projectId) return;

      socket.join(projectId);
      try {
        await Excalidraw.findOneAndUpdate(
          { projectId },
          { $setOnInsert: { elements: [] } },
          { upsert: true, new: true }
        );
      } catch (error) {
        logger.error("Failed to initialize Excalidraw room", {
          message: error.message,
        });
      }
    });

    socket.on("send-data", (data) => {
      if (!data?.projectId || !Array.isArray(data.elements)) return;
      io.to(data.projectId).emit("receive-data", { elements: data.elements });
    });

    socket.on("save-draw", async (data) => {
      if (!data?.projectId || !Array.isArray(data.elements)) return;

      try {
        await Excalidraw.findOneAndUpdate(
          { projectId: data.projectId },
          { elements: data.elements },
          { upsert: true }
        );
      } catch (error) {
        logger.error("Failed to save Excalidraw data", {
          message: error.message,
        });
      }
    });

    socket.on("send-task-embed", (data) => {
      if (!data?.projectId || !data?.task) return;
      io.to(data.projectId).emit("task-embed-receive", {
        task: data.task,
        sentBy: data.sentBy,
      });
    });

    socket.on("disconnect", async () => {
      const meta = await removeSocketFromUser(socket.id);
      if (!meta) return;
      await broadcastPresence(meta.projectId);
    });
  });

  await initializeRedisAdapter();
  return io;
};

module.exports = {
  createSocketServer,
};
