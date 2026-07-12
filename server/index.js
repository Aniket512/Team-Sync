require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const { errorHandler, AppError } = require("./utils/errorHandler");
const { authRouter } = require("./routes/auth.routes");
const { router } = require("./routes/routes");
const { validateSession } = require("./middlewares/validateSession");
const { createSocketServer } = require("./socket.service");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
  }),
);

app.use("/auth", authRouter);
app.use("/api", validateSession, router);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    logger.info("Database connection successful");
  })
  .catch((err) => {
    logger.error("Database connection failed", { message: err.message });
  });

const server = app.listen(PORT, () => logger.info(`Server started on ${PORT}`));

createSocketServer(server, CLIENT_ORIGIN, process.env.REDIS_URL).catch(
  (error) => {
    logger.error("Failed to initialize socket server", {
      message: error.message,
    });
  },
);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);
