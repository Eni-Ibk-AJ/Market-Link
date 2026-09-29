require("dotenv").config();
var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose");

const registerController = require("./controller/register");
const userInfoController = require("./controller/userInfoController");
const marketController = require("./controller/marketController");
const productController = require("./controller/productController");
const orderController = require("./controller/orderController");
const reviewController = require("./controller/reviewController");
const adminController = require("./controller/adminController");
const { authMiddleware, authorizeRoles } = require("./middleware/auth");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

var app = express();
app.use(express.json());

const allowedOrigins = [
  "https://marketlink-orcin.vercel.app/",
  "http://localhost:5173",
  "http://localhost:3000",
  // 'https://teslasafebroker.com',
  //  'https://api.teslasafebroker.com',
];

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// controller

// for the registration
registerController(app);
userInfoController(app);
marketController(app);
productController(app);
orderController(app);
reviewController(app);
app.get(
  "/api/admin/dashboard",
  authMiddleware,
  authorizeRoles("admin"),
  adminController.getAdminDashboard,
);
app.get(
  "/api/admin/users",
  authMiddleware,
  authorizeRoles("admin"),
  adminController.getAllUsers,
);
app.put(
  "/api/admin/users/:id",
  authMiddleware,
  authorizeRoles("admin"),
  adminController.updateUser,
);
app.delete(
  "/api/admin/users/:id",
  authMiddleware,
  authorizeRoles("admin"),
  adminController.deleteUser,
);
reviewController(app);
adminController(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MarketLink backend running on port ${PORT}`);
});
