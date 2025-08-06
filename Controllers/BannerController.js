const Banner = require("../Models/Banner");
 const cloudinary=require("cloudinary").v2

async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type, 
    timeout:120000
  });
}

const deleteFromCloudinary = async (public_id, resource_type = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });
    console.log(`Cloudinary delete result:`, result);
    return result;
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    throw error;
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title } = req.body;

    // Check if a file is uploaded
    if (!req.files || !req.files.background) {
      return res.status(400).json({ message: "Background file is required." });
    }

    const backgroundFile = req.files.background;

    // Detect file type (image or video)
    const mimeType = backgroundFile.mimetype;
    let resourceType = "image"; // default

    if (mimeType.startsWith("video")) {
      resourceType = "video";
    }

    // Upload to Cloudinary
    const uploadedMedia = await fileUploadToCloudinary(
      backgroundFile,
       "Saloon/banner",
       resourceType
    );

    // Save to MongoDB
    const newBanner = new Banner({
      title: title?.trim(),
      background: {
        public_id: uploadedMedia.public_id,
        url: uploadedMedia.secure_url,
      },
      createdBy: req.user.id,
    });

    await newBanner.save();

    return res.status(201).json({
      success: true,
      message: "Banner created successfully.",
      data: newBanner,
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not create banner.",
    });
  }
};


exports.updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const { title } = req.body;

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found." });
    }

    // Update title if provided
    if (title) {
      banner.title = title.trim();
    }

    // If a new background file is uploaded
    if (req.files && req.files.background) {
      const backgroundFile = req.files.background;
      const mimeType = backgroundFile.mimetype;
      const resourceType = mimeType.startsWith("video") ? "video" : "image";

      // Upload new background
      const uploadedMedia = await fileUploadToCloudinary(
        backgroundFile,
        "Saloon/banner",
        resourceType
      );

      // Delete old background from Cloudinary (optional but good practice)
      if (banner.background?.public_id) {
        await deleteFromCloudinary(banner.background.public_id, resourceType);
      }

      // Update background info
      banner.background = {
        public_id: uploadedMedia.public_id,
        url: uploadedMedia.secure_url,
      };
    }

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully.",
      data: banner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not update banner.",
    });
  }
};
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Banners fetched successfully.",
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not fetch banners.",
    });
  }
};
exports.deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }

    // Delete background from Cloudinary
    if (banner.background?.public_id) {
      const resourceType = banner.background.url.includes(".mp4") ? "video" : "image"; // crude check
      await deleteFromCloudinary(banner.background.public_id, resourceType);
    }

    // Delete banner from DB
    await banner.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not delete banner.",
    });
  }
};




