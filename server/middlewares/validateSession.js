const jwt = require("jsonwebtoken");

const validateSession = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const tokenHeader = req.headers.access_token;
  let token;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (typeof tokenHeader === "string") {
    token = tokenHeader;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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
