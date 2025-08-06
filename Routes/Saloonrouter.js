const express=require("express")
const router=express.Router()
const SaloonController=require("../Controllers/SaloonController")
const Ratingcontroller=require("../Controllers/RatingController")
const {auth,isSaloon}=require('../Middlewares/Authmiddleware')

router.route("/createsalooninfo").post(auth,isSaloon,SaloonController.createsaloon)
router.route("/updatesalooninfo/:id").put(auth,isSaloon,SaloonController.updatesaloon)

router.route("/createcategory").post(auth,isSaloon,SaloonController.createcategory)
router.route("/getallcategroyforsaloon").get(auth,isSaloon,SaloonController.getallacategoryforsaloon)
router.route("/updatecategory/:categoryId").put(auth,isSaloon,SaloonController.updatecategoryname)


router.route("/createservice").post(auth,isSaloon,SaloonController.createservices)
router.route("/deleteservice/:id").delete(auth,isSaloon,SaloonController.deleteService)
router.route("/updateservice/:id").put(auth,isSaloon,SaloonController.updateService)
router.route("/getsaloonservices/:saloonId").get(auth,isSaloon,SaloonController.getsaloonservices)


router.route("/registerbarber").post(auth,isSaloon,SaloonController.registerbarber)
router.route("/updatebarberinfo/:id").put(auth,isSaloon,SaloonController.updateBarber)


router.route("/deletereviewbysaloon/:reviewId").delete(auth,isSaloon,Ratingcontroller.deleteReviewBysaloon)

module.exports=router