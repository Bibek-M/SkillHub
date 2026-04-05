const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, "secret123");

    req.userid = decoded.userid;

    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
}

module.exports = {
  authMiddleware,
};
