import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./routes/routes.js";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

const PORT = process.env.PORT || 8080;
const url = process.env.MONGO_URL;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/images")));

//MongoDB Connection

const connectToDatabase = async () => {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB Database!");
  } catch (err) {
    throw err;
  }
};

//Middleware to parse incoming requiest
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

//routes
app.use("/", router);

app.listen(PORT, (req, res) => {
  connectToDatabase();
  console.log(`Server running on port ${PORT}....`);
});
