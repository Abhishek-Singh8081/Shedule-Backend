const express=require("express")
const router=express.Router()
const Authcontroller=require("../Controllers/Auth")

router.route("/signup").post(Authcontroller.signup)
router.route("/verifyotp").post(Authcontroller.verifyOtp)
router.route("/resendotp").post(Authcontroller.reSendOtp)
router.route("/login").post(Authcontroller.Login)
router.route("/forgotpassword").post(Authcontroller.forgotPassword)
router.route("/verifyforgotpasswordotp").post(Authcontroller.verifyForgotPasswordOtp)
router.route("/resetpassword").post(Authcontroller.resetPassword)
module.exports=router