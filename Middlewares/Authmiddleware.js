const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
  
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing", success: false });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized", success: false });
      }

      next(); // Move to next middleware/route
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", success: false });
    }
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        message: "Forbidden: Admin access required",
        success: false,
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

const isUser = async (req, res, next) => {
  try {
    if (req.user.accountType !== "User") {
      return res.status(403).json({
        message: "Forbidden: User access required",
        success: false,
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

const isSaloon = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Saloon") {
      return res.status(403).json({
        message: "Forbidden: Saloon access required",
        success: false,
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

module.exports = {auth,isUser,isAdmin,isSaloon};
