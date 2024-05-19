require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { authRouter } = require("./routes/auth.routes");
const { router } = require("./routes/routes");
const { validateSession } = require("./middlewares/validateSession");
const socket = require("socket.io");
const Excalidraw = require("./models/Excalidraw");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
    credentials: true,
    origin: process.env.ORIGIN,
  })
);

app.use("/auth", authRouter);
app.use("/api", validateSession, router);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

const io = require("socket.io")(server, {
  cors: {
    origin: true,
    credentials: true,
    transports: ["websocket", "polling"],
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
});

const onlineUsers = new Map();
let activeUsers = [];

io.on("connection", (socket) => {
  socket.on("add-user", (userId, projectId) => {
    onlineUsers.set(userId, socket.id);
    if (!activeUsers.some((user) => user.userId === userId)) {
      activeUsers.push({ userId: userId, projectId, socketId: socket.id });
    }
    io.emit("get-users", activeUsers);
  });

  socket.on("send-msg", (data) => {
    const projectUsers = activeUsers.filter(
      (user) => user.projectId === data.projectId
    );

    projectUsers.forEach((user) => {
      const sendUserSocket = onlineUsers.get(user.userId);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit("msg-receive", data);
      }
    });
  });

  socket.on("answer-survey", (data) => {
    const projectUsers = activeUsers.filter(
      (user) => user.projectId === data.projectId
    );

    projectUsers.forEach((user) => {
      const sendUserSocket = onlineUsers.get(user.userId);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit("survey-answer-receive", data);
      }
    });
  });

  socket.on("send-notification", (notification) => {
    const sendUserSocket = onlineUsers.get(notification.userId);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("notification", { notification });
    }
  });

  socket.on("join-room", async (projectId) => {
    socket.join(projectId);
    const excalidraw = await Excalidraw.findOne({
      projectId,
    });

    let elements = [];

    if (excalidraw) {
      elements = excalidraw.elements;
    } else {
      const newExcalidraw = new Excalidraw({
        projectId,
        elements: [],
      });
      await newExcalidraw.save();
    }
  });

  socket.on("send-data", (data) => {
    io.to(data.projectId).emit("receive-data", { elements: data.elements });
  });

  socket.on("save-draw", async (data) => {
    await Excalidraw.findOneAndUpdate(
      { projectId: data.projectId },
      {
        elements: data.elements,
      }
    );
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-users", activeUsers);
  });
});
