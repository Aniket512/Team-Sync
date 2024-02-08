const jwt = require("jsonwebtoken");

const validateSession = async (req, res, next) => {
  const { access_token } = req.headers;

  if (!access_token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(access_token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

module.exports = {
  validateSession,
};
