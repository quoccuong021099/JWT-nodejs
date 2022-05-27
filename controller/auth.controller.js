const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const authController = {
  // register
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      // create new user
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      // save user to database
      const user = await newUser.save();
      return res.status(200).json({
        code: 200,
        message: "Register successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  // login
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: "Username not found",
        });
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json({
          code: 404,
          message: "Password is incorrect",
        });
      }
      if (user && validPassword) {
        return res.status(200).json({ code: 200, data: user });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
module.exports = authController;
