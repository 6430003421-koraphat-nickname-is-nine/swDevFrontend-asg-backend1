const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const hospitals = require("./routes/hospitals");
const auth = require("./routes/auth");
const bookings = require("./routes/bookings");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const bodyParser = require("body-parser");
// const nodemailer = require("nodemailer");
dotenv.config({ path: "./config/config.env" });

connectDB();
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);
app.use(hpp());
app.use(cookieParser());
app.use("*.css", (req, res, next) => {
  res.set("Content-Type", "text/css");
  next();
});
app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/auth", auth);
app.use("/api/v1/bookings", bookings);

const PORT = process.env.PORT || 5001;
const server = app.listen(
  PORT,
  console.log(
    "Server running in",
    process.env.NODE_ENV,
    "on " + process.env.HOST + ":" + PORT
  )
);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "Hospital Booking API",
    },
    servers: [
      {
        url: process.env.HOST + ":" + PORT + "/api/v1",
        // url: "http://localhost:443/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocs, { customCssUrl: CSS_URL })
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
