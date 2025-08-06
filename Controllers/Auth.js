require("dotenv").config()
const bcrypt=require("bcrypt")
const User=require("../Models/User")
const sendEmail=require("../Utils/SendMail")
const jwt=require("jsonwebtoken")

const generateOtp= ()=> Math.floor(100000 + Math.random() * 900000).toString();


const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, accountType } = req.body;

    if (!email || !password || !confirmPassword || !name || !accountType) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedConfirmPassword,
      accountType,
      otp,
      otpExpires,
    });
    try {
      await sendEmail(
        email,
        "Verify your email",
        `Your OTP is ${otp}. It will expire in 5 minutes. you Ragister as ${accountType} `
      );
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ❌ OTP doesn't match
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP plase",
      });
    }

    // ❌ OTP expired
    if (user.otpExpires < new Date()) {
      await User.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. User data deleted.",
      });
    }

    // ✅ OTP is valid
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const reSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await user.save();
    try {
      await sendEmail(
        email,
        "Resend OTP",
        `your OTP is ${otp}. It will expire in 5 minutes.`
      );
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified",
        success: false,
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        message: "you are blocked",
        success: false,
      });
    }
  
    let payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
    };

   
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "10h",
      });
      user.token = token; // Store the token in the user object
      user.password = undefined;
      user.confirmPassword = undefined; 

      res.status(200).json({
        message: "Login successful",
        success: true,
        data: {
          user,
          token,
        },
      });
    } else {
      return res.status(401).json({
        message: "Invalid password",
        success: false,
      });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User with this email not found" });
    }


    const otp = generateOtp();

 
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; 
    await user.save();

   
    try {
      await sendEmail(
        email,
        "Verify your email",
        `Your OTP is ${otp}. It will expire in 5 minutes.You requested a password reset.`
      );
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
  

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if(!user.isEmailVerified){
      return res.status(400).json({success:false,message:"Email not verified please verify your verify email."})
    }



    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;
  

    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // OTP doesn't match
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP expired
    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // OTP is valid
    // Optionally you can clear OTP fields after verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Forgot Password OTP verification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {signup, verifyOtp,reSendOtp,Login,forgotPassword,resetPassword,verifyForgotPasswordOtp}