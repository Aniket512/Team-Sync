const socket = require("..");

function sendNotification(notification) {
  const userIdString = notification.userId.toString();
  const sendUserSocket = socket.ioObject.onlineUsers.get(userIdString);
  if (sendUserSocket) {
    socket.ioObject.socketIoObject
      .to(sendUserSocket)
      .emit("notification", { notification });
  }
}

module.exports = { sendNotification };
