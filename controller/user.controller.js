const User = require("../models/User.model");

const userController = {
  // get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      return res.status(200).json({
        code: 200,
        data: users,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  deleteUser: async (req, res) => {
    try {
      await User.findById(req.params.id);
      const allUsers = await User.find();
      return res.status(200).json({
        code: 200,
        message: "Delete user successfully",
        data: allUsers,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = userController;
