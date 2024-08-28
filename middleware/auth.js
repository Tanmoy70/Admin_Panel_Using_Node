import jwt from "jsonwebtoken";
import Users from "../model/Users.js";

export const authenticateToken = async (req, res, next) => {
  const match = req.cookies.Jwtoken;
  if (!match) {
    return res.status(401).json({
      message: "Access Denied: No Token Provided",
      success: false,
    });
  }
  try {
    const decoded = jwt.verify(match, process.env.JWT_KEY);
    const user = await Users.findById(decoded._id);
    if (!user) {
      return res.status(401).json({
        message: "Invalid Token: User Not Found",
        success: false,
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid Token", success: false });
  }
};
