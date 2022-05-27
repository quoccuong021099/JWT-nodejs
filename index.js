const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route");

dotenv.config();
const port = process.env.PORT;
const routeApiCommon = process.env.ROUTE_API;
const app = express();

mongoose.connect(process.env.CONNECT_MONGO_URL, () => {
  console.log("Connected to mongodb successfully");
});

// Tránh lỗi cors
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use(`${routeApiCommon}/auth`, authRoute);

// lắng nghe sự kiện trên port
app.listen(port, () => {
  console.log("Server is running in: http://localhost:" + port);
});
