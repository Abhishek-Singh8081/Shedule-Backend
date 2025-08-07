const Promo=require("../Models/Promo")
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

exports.createPromo = async (req, res) => {
  try {
    const { title,description } = req.body;
    if(!title && !description){
        return res.status(400).json({message:"Required fields are missing"})

    }


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
      "Saloon/promo",
      "image"
    );

    const newPromo = new Promo({
      title: title?.trim(),
      description:description,
      background: {
        public_id: uploadedMedia.public_id,
        url: uploadedMedia.secure_url,
      },
      createdBy: req.user.id,
    });

    await newPromo.save();

    return res.status(201).json({
      success: true,
      message: "Promo image created successfully.",
      data: newPromo,
    });
  } catch (error) {
    console.error("Error creating promo image:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not create gallery image.",
    });
  }
};

exports.updatePromo = async (req, res) => {
  try {
    const { promoId } = req.params;
    const { title,description } = req.body;

    const promo = await Promo.findById(promoId);
    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo image not found." });
    }

    if (title?.trim()) {
      promo.title = title.trim();
    }
    if(description){
        promo.description=description
    }

    if (req.files && req.files.background) {
      const backgroundFile = req.files.background;
      const mimeType = backgroundFile.mimetype;

      if (!mimeType.startsWith("image")) {
        return res.status(400).json({ message: "Only image uploads are allowed." });
      }

      const uploadedMedia = await fileUploadToCloudinary(
        backgroundFile,
        "Saloon/promo",
        "image"
      );

      if (promo.background?.public_id) {
        await deleteFromCloudinary(promo.background.public_id, "image");
      }

      promo.background = {
        public_id: uploadedMedia.public_id,
        url: uploadedMedia.secure_url,
      };
    }

    await promo.save();

    return res.status(200).json({
      success: true,
      message: "Promo image updated successfully.",
      data: promo,
    });
  } catch (error) {
    console.error("Error updating promo image:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not update promo image.",
    });
  }
};

exports.getAllPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Promo images fetched successfully.",
      data: promos,
    });
  } catch (error) {
    console.error("Error fetching promo images:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not fetch promo images.",
    });
  }
};

exports.deletePromo = async (req, res) => {
  try {
    const { promoId } = req.params;

    const promo = await Promo.findById(promoId);
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo image not found.",
      });
    }

    if (promo.background?.public_id) {
      await deleteFromCloudinary(promo.background.public_id, "image");
    }

    await promo.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Promo image deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting promo image:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not delete promo image.",
    });
  }
};

