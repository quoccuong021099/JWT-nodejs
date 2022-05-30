const router = require("express").Router();
const userController = require("../controller/user.controller");
const middlewareController = require("../controller/middleware.controller");
// get all user
router.get("/", middlewareController.verifyToken, userController.getAllUsers);

// delete user
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.deleteUser
);

module.exports = router;
