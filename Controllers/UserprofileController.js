const User=require("../Models/User")
const cloudinary=require("cloudinary").v2

async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type, 
  });
}

const deleteFromCloudinary = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
  }
};



exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // JWT se aya hua user
    const user = await User.findById(userId)
      .select("-password -confirmPassword -otp -otpExpires")
      .populate("saloonId");  // Populate saloon details

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, userdata: user });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};


exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      mobileNumber,
      gender,
      alternativeMobileNumber,
      location,
    } = req.body;

    const updatedData = {};
    if (mobileNumber) updatedData.mobileNumber = mobileNumber;
    if (gender) updatedData.gender = gender;
    if (alternativeMobileNumber)
      updatedData.alternativeMobileNumber = alternativeMobileNumber;
    if (location) updatedData.location = location;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If new image uploaded, delete old and update
    if (req.files && req.files.image) {
      const file = req.files.image;

      // ✅ Delete old image from Cloudinary
      if (user.image && user.image.public_id) {
        await deleteFromCloudinary(user.image.public_id);
      }

      // ✅ Upload new image
      const uploadedImage = await fileUploadToCloudinary(
        file,
        "Saloon/user-profile"
      );

      updatedData.image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    // ✅ Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password -confirmPassword");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
