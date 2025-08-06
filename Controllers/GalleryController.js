const Gallery = require("../Models/Gallery");
const cloudinary = require("cloudinary").v2;

// Upload helper
async function fileUploadToCloudinary(file, folder, type = "image") {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type, 
    timeout: 120000
  });
}

// Delete helper
const deleteFromCloudinary = async (public_id, resource_type = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });
    console.log("Cloudinary delete result:", result);
    return result;
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    throw error;
  }
};

exports.createGallery = async (req, res) => {
  try {
    const { title } = req.body;

    // Require image file
    if (!req.files || !req.files.background) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const backgroundFile = req.files.background;
    const mimeType = backgroundFile.mimetype;

    if (!mimeType.startsWith("image")) {
      return res.status(400).json({ message: "Only image uploads are allowed." });
    }

    const uploadedMedia = await fileUploadToCloudinary(
      backgroundFile,
      "Saloon/gallery",
      "image"
    );

    const newGallery = new Gallery({
      title: title?.trim(),
      background: {
        public_id: uploadedMedia.public_id,
        url: uploadedMedia.secure_url,
      },
      createdBy: req.user.id,
    });

    await newGallery.save();

    return res.status(201).json({
      success: true,
      message: "Gallery image created successfully.",
      data: newGallery,
    });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not create gallery image.",
    });
  }
};

exports.updateGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const { title } = req.body;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ success: false, message: "Gallery image not found." });
    }

    if (title?.trim()) {
      gallery.title = title.trim();
    }

    if (req.files && req.files.background) {
      const backgroundFile = req.files.background;
      const mimeType = backgroundFile.mimetype;

      if (!mimeType.startsWith("image")) {
        return res.status(400).json({ message: "Only image uploads are allowed." });
      }

      const uploadedMedia = await fileUploadToCloudinary(
        backgroundFile,
        "Saloon/gallery",
        "image"
      );

      if (gallery.background?.public_id) {
        await deleteFromCloudinary(gallery.background.public_id, "image");
      }

      gallery.background = {
        public_id: uploadedMedia.public_id,
        url: uploadedMedia.secure_url,
      };
    }

    await gallery.save();

    return res.status(200).json({
      success: true,
      message: "Gallery image updated successfully.",
      data: gallery,
    });
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not update gallery image.",
    });
  }
};

exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Gallery images fetched successfully.",
      data: galleries,
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not fetch gallery images.",
    });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found.",
      });
    }

    if (gallery.background?.public_id) {
      await deleteFromCloudinary(gallery.background.public_id, "image");
    }

    await gallery.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not delete gallery image.",
    });
  }
};

