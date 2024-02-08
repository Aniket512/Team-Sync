require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { authRouter } = require("./routes/auths");
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
    origin: "http://localhost:3000",
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

const io = new socket.Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
  },
});

let excalidrawData = {};

io.on("connection", (socket) => {
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

    io.to(projectId).emit("set-initial-data", {
      elements,
    });
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

  // Listen for changes from clients and broadcast them to others
  socket.on("data", (data) => {
    excalidrawData = data;
    io.emit("data", excalidrawData);
  });

  socket.on("answer-survey", (data) => {
    io.emit("answer-survey", data);
  });
});
