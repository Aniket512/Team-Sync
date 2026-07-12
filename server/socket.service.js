const { Server } = require("socket.io");
const Redis = require("ioredis");
const { createAdapter } = require("@socket.io/redis-adapter");
const logger = require("./utils/logger");
const Excalidraw = require("./models/Excalidraw");

/**
 * Socket server — Redis is required for presence + multi-instance fan-out.
 *
 * Clients:
 *   redisClient  → presence keys + notification targeting
 *   pubClient    → Socket.IO Redis adapter publish
 *   subClient    → Socket.IO Redis adapter subscribe
 *
 * Presence keys:
 *   userSockets:{userId}                      → all sockets for a user
 *   projectUsers:{projectId}                  → online user ids in a project
 *   projectUserSockets:{projectId}:{userId}   → that user's sockets in a project
 *   socketMeta:{socketId}                     → { userId, projectId } for cleanup
 */
const createSocketServer = async (server, clientOrigin, redisUrl) => {
  if (!redisUrl) {
    throw new Error(
      "REDIS_URL is required. Presence and realtime sockets depend on Redis."
    );
  }

  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
      transports: ["websocket", "polling"],
      methods: ["GET", "POST"],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  const redisClient = new Redis(redisUrl, { lazyConnect: true });
  const pubClient = redisClient.duplicate({ lazyConnect: true });
  const subClient = redisClient.duplicate({ lazyConnect: true });

  // Track socket ids owned by THIS process (for pruning dead local connections)
  const localSocketIds = new Set();

  const isRedisReady = () => redisClient.status === "ready";

  const initializeRedis = async () => {
    await Promise.all([
      redisClient.connect(),
      pubClient.connect(),
      subClient.connect(),
    ]);
    io.adapter(createAdapter(pubClient, subClient));
    logger.info("Socket.io Redis adapter enabled.");
  };

  const isSocketAlive = (socketId) => Boolean(io.sockets.sockets.get(socketId));

  /** Online users for a project; prune sockets whose meta was already cleared */
  const getProjectUsers = async (projectId) => {
    if (!isRedisReady()) return [];

    const userIds = await redisClient.smembers(`projectUsers:${projectId}`);
    const online = [];

    for (const userId of userIds) {
      const socketIds = await redisClient.smembers(
        `projectUserSockets:${projectId}:${userId}`
      );
      let aliveCount = 0;

      for (const socketId of socketIds) {
        const meta = await redisClient.get(`socketMeta:${socketId}`);
        if (!meta) {
          await redisClient.srem(
            `projectUserSockets:${projectId}:${userId}`,
            socketId
          );
          await redisClient.srem(`userSockets:${userId}`, socketId);
          continue;
        }

        // This process owned the socket but it is gone — clean Redis now
        if (localSocketIds.has(socketId) && !isSocketAlive(socketId)) {
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
          localSocketIds.delete(socketId);
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
  };

  const addSocketToUser = async (userId, socketId, projectId) => {
    const uid = String(userId);
    const pid = String(projectId);

    localSocketIds.add(socketId);
    await Promise.all([
      redisClient.sadd(`userSockets:${uid}`, socketId),
      redisClient.sadd(`projectUserSockets:${pid}:${uid}`, socketId),
      redisClient.sadd(`projectUsers:${pid}`, uid),
      redisClient.set(
        `socketMeta:${socketId}`,
        JSON.stringify({ userId: uid, projectId: pid })
      ),
    ]);
  };

  const removeSocketFromUser = async (socketId) => {
    localSocketIds.delete(socketId);

    const metaString = await redisClient.get(`socketMeta:${socketId}`);
    if (!metaString) return null;

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

    return { userId, projectId };
  };

  const emitNotificationToUser = async (notification) => {
    if (!notification?.userId) return;
    const targetUserId = String(notification.userId);
    const socketIds = await redisClient.smembers(`userSockets:${targetUserId}`);
    for (const socketId of socketIds) {
      io.to(socketId).emit("notification", { notification });
    }
  };

  const broadcastPresence = async (projectId) => {
    if (!projectId) return;
    const projectUsers = await getProjectUsers(projectId);
    io.to(projectId).emit("get-users", projectUsers);
  };

  io.on("connection", (socket) => {
    localSocketIds.add(socket.id);

    socket.on("add-user", async (userId, projectId) => {
      if (!userId || !projectId) return;

      const uid = String(userId);
      const pid = String(projectId);

      const previous = await removeSocketFromUser(socket.id);
      if (previous?.projectId && previous.projectId !== pid) {
        socket.leave(previous.projectId);
        await broadcastPresence(previous.projectId);
      }

      socket.join(pid);
      await addSocketToUser(uid, socket.id, pid);
      await broadcastPresence(pid);
    });

    socket.on("leave-user", async () => {
      const meta = await removeSocketFromUser(socket.id);
      if (!meta) return;
      socket.leave(meta.projectId);
      await broadcastPresence(meta.projectId);
    });

    socket.on("request-users", async (projectId) => {
      if (!projectId) return;
      const projectUsers = await getProjectUsers(String(projectId));
      socket.emit("get-users", projectUsers);
    });

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

  try {
    await initializeRedis();
  } catch (error) {
    logger.error("Failed to connect Redis for sockets", {
      message: error.message,
    });
    throw error;
  }

  return io;
};

module.exports = {
  createSocketServer,
};
