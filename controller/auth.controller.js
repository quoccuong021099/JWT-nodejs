const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

let refreshTokenArr = [];

const authController = {
  // generate token
  generateToken: async (user) => {
    const accessToken = jwt.sign(
      { id: user.id, admin: user.admin },
      process.env.JWT_SECRET,
      {
        expiresIn: "90s",
      }
    );
    return accessToken;
  },
  // generate token
  generateRefreshToken: async (user) => {
    const refreshToken = jwt.sign(
      { id: user.id, admin: user.admin },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "90d",
      }
    );
    return refreshToken;
  },
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
        const accessToken = await authController.generateToken(user);
        const refreshToken = await authController.generateRefreshToken(user);
        refreshTokenArr.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: "false",
          path: "/",
          sameSite: "strict",
        });
        const { password, ...other } = user._doc;
        return res.status(200).json({ code: 200, data: other, accessToken });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  refreshToken: async (req, res) => {
    //  take token(refresh) from cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ code: 401, message: "You are not authenticated" });
    }
    if (!refreshTokenArr.includes(refreshToken)) {
      return res
        .status(403)
        .json({ code: 403, message: "Refresh token is not valid" });
    }
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, user) => {
        if (err) {
          return res.status(403).json({
            code: 403,
            message: "Token is not valid",
          });
        }
        refreshTokenArr = refreshTokenArr.filter(
          (item) => item !== refreshToken
        );
        // create new accessToken và refreshToken
        const newAccessToken = authController.generateToken(user);
        const newRefreshToken = authController.generateRefreshToken(user);
        refreshTokenArr.push(newRefreshToken);
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: "false",
          path: "/",
          sameSite: "strict",
        });
        return res.status(200).json({ code: 200, accessToken: newAccessToken });
      }
    );
  },
  // user logout
  logoutUser: async (req, res) => {
    try {
      res.clearCookie("refreshToken");
      refreshTokenArr = refreshTokenArr.filter(
        (item) => item !== req.cookies.refreshToken
      );
      return res
        .status(200)
        .json({ code: 200, message: "Logout successfully" });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
module.exports = authController;
