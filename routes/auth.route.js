const router = require("express").Router();
const authController = require("../controller/auth.controller");
const middlewareController = require("../controller/middleware.controller");

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.post(
  "/logout",
  middlewareController.verifyToken,
  authController.logoutUser
);

// refresh token
router.post("/refresh", authController.refreshToken);

module.exports = router;
