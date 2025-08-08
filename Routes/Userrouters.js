const express=require("express")
const router=express.Router()
const Userprofile=require("../Controllers/UserprofileController")
const {auth,isAdmin,isSaloon,isUser}=require('../Middlewares/Authmiddleware')
const Ratingcontroller=require("../Controllers/RatingController")
const Bookingcontroller=require("../Controllers/BookingController")


router.route("/updateprofile").put(auth,isUser,Userprofile.updateUserProfile)
router.route("/getuserprofile").get(auth,Userprofile.getUserProfile)

router.route("/createrating").post(auth,isUser,Ratingcontroller.createReview)
router.route("/updaterating/:reviewId").put(auth,isUser,Ratingcontroller.updateReview)
router.route("/deleterating/:reviewId").delete(auth,isUser,Ratingcontroller.deleteReview)
router.route("/getallreviewsforsaloon/:saloonId").get(Ratingcontroller.getAllReviewsForSaloon)

router.route("/slots").post(auth, isUser, Bookingcontroller.getAvailableSlots);
router.route("/bookappointment").post(auth,isUser,Bookingcontroller.bookappointment)


module.exports=router