const express=require("express")
const router=express.Router()
const {isAdmin,auth}=require("../Middlewares/Authmiddleware")
const Bannercontroller=require("../Controllers/BannerController")
const Gallerycontroller=require("../Controllers/GalleryController")

router.route("/createbanner").post(auth,isAdmin,Bannercontroller.createBanner)
router.route("/updatebanner/:bannerId").put(auth,isAdmin,Bannercontroller.updateBanner)
router.route("/getallbanners").get( Bannercontroller.getAllBanners);
router.route("/banners/:bannerId").delete( auth,isAdmin,Bannercontroller.deleteBanner);


router.route("/creategallerybanner").post(auth,isAdmin,Gallerycontroller.createGallery)
router.route("/updategallerybanner/:galleryId").put(auth,isAdmin,Gallerycontroller.updateGallery)
router.route("/getallgallerybanner").get(Gallerycontroller.getAllGalleries );
router.route("/deletegallerybanner/:galleryId").delete( auth,isAdmin,Gallerycontroller.deleteGallery);








module.exports=router