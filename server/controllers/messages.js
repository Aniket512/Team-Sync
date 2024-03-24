const Message = require("../models/Message");

module.exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.body;
    const messages = await Message.find({ projectId }).populate("sender").sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        _id: msg._id,
        fromSelf: msg.sender._id.toString() === req.user._id,
        message: msg.message,
        sender: msg.sender,
        createdAt: msg.createdAt
      };
    });
    res.status(200).json(projectedMessages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to get messages",
    });
  }
};

module.exports.addMessage = async (req, res) => {
  try {
    const { from, message, projectId } = req.body;
    if (!from || !message || !projectId) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    const savedMesssage = await Message.create({
      message,
      sender: from,
      projectId,
    });

    await savedMesssage.populate("sender");
    return res.status(201).json(savedMesssage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to add message to the database",
    });
  }
};
