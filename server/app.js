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
<<<<<<< HEAD
  "http://localhost:5173",
  "http://localhost:3000",
  // 'https://teslasafebroker.com',
  //  'https://api.teslasafebroker.com',
=======
    'http://localhost:3000', 
    'http://localhost:5173', 
    // 'https://teslasafebroker.com',
    //  'https://api.teslasafebroker.com', 
>>>>>>> f0f338475f6dca0050fb276415fa4de8c66b3ba1
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
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
<<<<<<< HEAD
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
=======
reviewController(app); 
adminController(app);


>>>>>>> f0f338475f6dca0050fb276415fa4de8c66b3ba1

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MarketLink backend running on port ${PORT}`);
});
