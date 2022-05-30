const jwt = require("jsonwebtoken");

const middlewareController = {
  // verify token
  verifyToken: async (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      const accessToken = token.split(" ")[1];
      if (token.split(" ")[0].includes("Bearer")) {
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
          if (err) {
            return res.status(403).json({
              code: 403,
              message: "Token is not valid",
            });
          }
          req.user = user;
          next();
        });
      } else {
        return res.status(404).json({
          code: 404,
          message: "You must use Bearer token",
        });
      }
    } else {
      return res.status(401).json({
        code: 401,
        message: "You are not authenticated",
      });
    }
  },
  // verify token and admin auth
  verifyTokenAndAdminAuth: async (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.admin || req.user.id === req.params.id) {
        next();
      } else {
        return res.status(403).json({
          code: 403,
          message: "You are not authorized to perform this action",
        });
      }
    });
  },
};
module.exports = middlewareController;
