const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers.token;
  if (!token) {
    res.status(403).json({
      message: "Wrong Token",
    });
    return;
  }
  const decoded = jwt.verify(token, "secret123");
  const userid = decoded.userid;
  if (decoded) {
    req.userid = parseInt(userid);
    next();
  } else {
    res.status(403).json({
      message: "Wrong secret",
    });
  }
}
module.exports = {
  authMiddleware: authMiddleware,
};
