const express=require("express")
const router=express.Router()
const {isAdmin,auth}=require("../Middlewares/Authmiddleware")
const Bannercontroller=require("../Controllers/BannerController")
const Gallerycontroller=require("../Controllers/GalleryController")
const Promocontroller=require("../Controllers/PromoController")
const Faqcontroller=require("../Controllers/FaqController")
const Infocontroller=require("../Controllers/InfoController")

router.route("/createbanner").post(auth,isAdmin,Bannercontroller.createBanner)
router.route("/updatebanner/:bannerId").put(auth,isAdmin,Bannercontroller.updateBanner)
router.route("/getallbanners").get( Bannercontroller.getAllBanners);
router.route("/banners/:bannerId").delete( auth,isAdmin,Bannercontroller.deleteBanner);


router.route("/creategallerybanner").post(auth,isAdmin,Gallerycontroller.createGallery)
router.route("/updategallerybanner/:galleryId").put(auth,isAdmin,Gallerycontroller.updateGallery)
router.route("/getallgallerybanner").get(Gallerycontroller.getAllGalleries );
router.route("/deletegallerybanner/:galleryId").delete( auth,isAdmin,Gallerycontroller.deleteGallery);

// for promos

router.route("/createpromo").post(auth,isAdmin,Promocontroller.createPromo)
router.route("/updatepromo/:promoId").put(auth,isAdmin,Promocontroller.updatePromo)
router.route("/getallpromos").get(Promocontroller.getAllPromos );
router.route("/deletepromo/:promoId").delete( auth,isAdmin,Promocontroller.deletePromo);


router.route("/createfaq").post(auth,isAdmin,Faqcontroller.createFAQ)
router.route("/getallfaq").get(Faqcontroller.getAllActiveFAQs)
router.route("/deletefaq/:id").delete(auth,isAdmin,Faqcontroller.deleteFAQ)
router.route("/updatefaq/:id").put(auth,isAdmin,Faqcontroller.updateFAQ)

router.route("/createinfo").post(auth,isAdmin,Infocontroller.createinfo)
router.route("/updateinfo/:id").put(auth,isAdmin,Infocontroller.updateinfo)
router.route("/getinfo").get(Infocontroller.getInfo)










module.exports=router