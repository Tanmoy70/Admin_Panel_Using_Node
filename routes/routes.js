import Users from "../model/Users.js";
import DashboardUser from "../model/DashboardUser.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

import express from "express";

const router = express.Router();

//Display login form
router.get("/", (req, res) => {
  res.render("home");
});

//Display register form
router.get("/register", (req, res) => {
  res.render("register");
});

//Display login form

router.get("/login", (req, res) => {
  res.render("login");
});

//handle register form submission

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await Users.findOne({ email });

    if (user) {
      return res
        .status(409)
        .json({ message: "User is already exists", success: false });
    }
    const userModel = new Users({ name, email, password });

    userModel.password = await bcrypt.hash(password, 10);

    await userModel.save();
    res.redirect("/login");
  } catch (err) {
    res.status(500).json({
      message: "Internel Server Error",
      success: false,
    });
  }
});

// Handle login form submission

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication is failed!", success: false });
    }
    const pass = await bcrypt.compare(password, user.password);

    if (!pass) {
      return res.status(401).json({
        message: "Authentication is failed, Worng password or email!",
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_KEY,
      { expiresIn: "2hr" }
    );

    user.tokens.push({ token: jwtToken });
    await user.save();

    res.cookie("Jwtoken", jwtToken, {
      maxAge: 3600000,
    });

    // console.log(req.cookies.jwt);

    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).json({
      message: "Internel Server Error",
      success: false,
    });
  }
});

// Display dashboard page with token authentication

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const users = await DashboardUser.find().exec();
    res.render("dashboard", { users: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Display the add page for adding new users

router.get("/add", (req, res) => {
  res.render("add", { title: "Add New User" });
});

//Insert an user into database route

router.post("/add", upload, async (req, res) => {
  try {
    const user = new DashboardUser({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });
    await user.save();

    req.session.message = {
      type: "success",
      message: "User added successfully!",
    };
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).json({
      message: "Internel Server Error",
      success: false,
    });
  }
});

export default router;
