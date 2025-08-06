const Saloon=require("../Models/Saloon")
const Category=require("../Models/Category")
const Service=require("../Models/Services")
const User=require("../Models/User")
const bcrypt=require("bcrypt")
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



exports.createsaloon = async (req, res) => {
  try {
    const {
      saloonName,
      saloonLocation,
      saloonContactNumber,
      religion,
      caste,
      saloonservices
    } = req.body;

    const userId = req.user.id;

    let imageData = null;

    // Check and upload image if it exists
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const uploadedImage = await fileUploadToCloudinary(imageFile,"Saloon/saloonimages");

      imageData = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id
      };
    }

    // Create new Saloon
    const newSaloon = new Saloon({
      user: userId,
      saloonName,
      saloonLocation,
      saloonContactNumber,
      religion,
      caste,
      saloonservices,
      image: imageData // may be null or valid object
    });

    const savedSaloon = await newSaloon.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { saloonId: savedSaloon._id },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found to update saloonId" });
    }

    res.status(201).json({
      message: "Saloon created and linked to user successfully",
      saloon: savedSaloon,
      user: updatedUser
    });
  } catch (error) {
    console.error("Create saloon controller error:", error);
    res.status(500).json({
      message: "Failed to create saloon",
      error: error.message
    });
  }
};
exports.updatesaloon = async (req, res) => {
  try {
    const saloonId = req.params.id;
    const {
      saloonName,
      saloonLocation,
      saloonContactNumber,
      religion,
      caste,
      saloonservices
    } = req.body;

    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({ message: "Saloon not found" });
    }

    // Update fields only if provided
    if (saloonName) saloon.saloonName = saloonName;
    if (saloonLocation) saloon.saloonLocation = saloonLocation;
    if (saloonContactNumber) saloon.saloonContactNumber = saloonContactNumber;
    if (religion) saloon.religion = religion;
    if (caste) saloon.caste = caste;
    if (saloonservices) saloon.saloonservices = saloonservices;

    // Handle new image upload
    if (req.files && req.files.image) {
      const newImageFile = req.files.image;

      // Delete old image from Cloudinary
      if (saloon.image && saloon.image.public_id) {
        await deleteFromCloudinary(saloon.image.public_id);
      }

      // Upload new image
      const uploadedImage = await fileUploadToCloudinary(newImageFile, "Saloon/saloonimages");

      saloon.image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id
      };
    }

    const updatedSaloon = await saloon.save();

    res.status(200).json({
      message: "Saloon updated successfully",
      saloon: updatedSaloon
    });
  } catch (error) {
    console.error("Update saloon controller error:", error);
    res.status(500).json({
      message: "Failed to update saloon",
      error: error.message
    });
  }
};







exports.createcategory = async (req, res) => {
    try {
        const { name, saloonId } = req.body;
        const userId = req.user.id; // Assumes user is authenticated and available

        if (!saloonId) {
            return res.status(400).json({ message: "Saloon ID is required" });
        }

        // Check if category with the same name already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ message: "Category name already exists" });
        }

        // Create new category
        const newCategory = new Category({
            name: name.trim(),
            createdBy: userId
        });

        const savedCategory = await newCategory.save();

        // Update the saloon document to push the new category ID into saloonservices
        const updatedSaloon = await Saloon.findByIdAndUpdate(
            saloonId,
            { $push: { saloonservices: savedCategory._id } },
            { new: true }
        );

        if (!updatedSaloon) {
            return res.status(404).json({ message: "Saloon not found" });
        }

        res.status(201).json({
            message: "Category created and added to saloon successfully",
            category: savedCategory,
            
        });
    } catch (error) {
        console.log("Error in create category:", error);
        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
};
exports.getallacategoryforsaloon = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find categories created by this user and populate only the services array
    const categories = await Category.find({ createdBy: userId })
      .populate({
        path: 'services',
        // optionally select fields
        // select: 'servicename price duration published'
      })
      .exec();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error in get all category for saloon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};
exports.updatecategoryname = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({ message: "Category ID and name are required" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category name updated successfully",
      category: updatedCategory
    });
  } catch (error) {
    console.error("Error updating category name:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





exports.createservices = async (req, res) => {
  try {
    const {
      servicename,
      saloonId,
      categoryId,
      description,
      priceType,
      price,
      duration
    } = req.body;

    const userId = req.user.id; // Assuming authentication middleware sets this

    if (!servicename || !saloonId || !categoryId || !duration) {
      return res.status(400).json({
        message: "Required fields: servicename, saloonId, categoryId, duration"
      });
    }

    // Check for duplicate service name (optional)
    const existingService = await Service.findOne({ servicename: servicename.trim() });
    if (existingService) {
      return res.status(400).json({ message: "Service name already exists" });
    }

    // Prepare data for new service - only add optional fields if present
    const newServiceData = {
      servicename: servicename.trim(),
      saloonId,
      categoryId,
      duration,
      createdBy: userId,
    };

    if (description) newServiceData.description = description;
    if (priceType) newServiceData.priceType = priceType;
    if (price !== undefined) newServiceData.price = price;

    const newService = new Service(newServiceData);

    const savedService = await newService.save();

    // Push service ID into corresponding category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $push: { services: savedService._id } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(201).json({
      message: "Service created and added to category successfully",
      service: savedService,
    });

  } catch (error) {
    console.log("Error in service controller", error);
    res.status(500).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};
exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the service to get its categoryId before deleting
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Delete the service document
    await Service.findByIdAndDelete(serviceId);

    // Remove serviceId from the services array in the category
    const updatedCategory = await Category.findByIdAndUpdate(
      service.categoryId,
      { $pull: { services: serviceId } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Service deleted successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
};
exports.updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const {
      servicename,
      saloonId,
      categoryId,
      description,
      priceType,
      price,
      duration,
      published,
    } = req.body;

    // Validate required fields if provided
    if (servicename && servicename.length > 100) {
      return res.status(400).json({ message: "Service name max length is 100 characters" });
    }
    if (priceType && !["Free", "Fixed"].includes(priceType)) {
      return res.status(400).json({ message: "Price type must be 'Free' or 'Fixed'" });
    }

    // Build the update object only with provided fields
    const updateData = {};

    if (servicename) updateData.servicename = servicename.trim();
    if (saloonId) updateData.saloonId = saloonId;
    if (categoryId) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description;
    if (priceType !== undefined) updateData.priceType = priceType;
    if (price !== undefined) updateData.price = price;
    if (duration) updateData.duration = duration;
    if (published !== undefined) updateData.published = published;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // Check if servicename is unique (if updated)
    if (updateData.servicename) {
      const existingService = await Service.findOne({ servicename: updateData.servicename, _id: { $ne: serviceId } });
      if (existingService) {
        return res.status(400).json({ message: "Service name already exists" });
      }
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(serviceId, updateData, { new: true, runValidators: true });

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      message: "Failed to update service",
      error: error.message,
    });
  }
};
exports.getsaloonservices = async (req, res) => {
  try {
    const { saloonId } = req.params;

    if (!saloonId) {
      return res.status(400).json({ message: "Saloon ID is required" });
    }

    const services = await Service.find({ saloonId: saloonId });

    if (services.length === 0) {
      return res.status(404).json({ message: "No services found for this saloon" });
    }

    res.status(200).json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};







exports.registerbarber = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      mobileNumber,
      gender,
      dateOfBirth,
      saloonId,
      workingHours,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword || !saloonId) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default working hours
    const defaultWorkingHours = { /* as before */ };

    let finalWorkingHours = defaultWorkingHours;
    if (workingHours && typeof workingHours === "object") {
      finalWorkingHours = { ...defaultWorkingHours };
      for (const day of Object.keys(defaultWorkingHours)) {
        if (workingHours[day]) {
          finalWorkingHours[day] = {
            start: workingHours[day].start || defaultWorkingHours[day].start,
            end: workingHours[day].end || defaultWorkingHours[day].end,
            available:
              workingHours[day].available !== undefined
                ? workingHours[day].available
                : defaultWorkingHours[day].available,
          };
        }
      }
    }

    // Image upload logic
    let image = null;
    if (req.files && req.files.image) {
      const uploadedImage = await fileUploadToCloudinary(req.files.image, "Saloon/user-profile");
      image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    const newBarber = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      accountType: "Barber",
      saloonId,
      mobileNumber,
      gender,
      dateOfBirth,
      isEmailVerified: true,
      workingHours: finalWorkingHours,
      image,
    });

    await Saloon.findByIdAndUpdate(
      saloonId,
      { $push: { barbers: newBarber._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Barber registered successfully and added to saloon",
      user: {
        _id: newBarber._id,
        name: newBarber.name,
        email: newBarber.email,
        accountType: newBarber.accountType,
        saloonId: newBarber.saloonId,
        workingHours: newBarber.workingHours,
        image: newBarber.image,
      },
    });
  } catch (error) {
    console.error("Error registering barber:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.updateBarber = async (req, res) => {
  try {
    const barberId = req.params.id;
    const {
      name,
      email,
      password,
      confirmPassword,
      mobileNumber,
      gender,
      dateOfBirth,
      saloonId,
      workingHours,
    } = req.body;

    const barber = await User.findById(barberId);
    if (!barber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    // Email update check
    
    if (email && email !== barber.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({ message: "Email is already registered" });
      }
      barber.email = email;
    }

    // Password update check
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      barber.password = await bcrypt.hash(password, 10);
      barber.confirmPassword = barber.password;
    }

    // Update other fields if provided
    if (name) barber.name = name;
    if (mobileNumber) barber.mobileNumber = mobileNumber;
    if (gender) barber.gender = gender;
    if (dateOfBirth) barber.dateOfBirth = dateOfBirth;
    if (saloonId) barber.saloonId = saloonId;

    // Working hours update
    if (workingHours && typeof workingHours === "object") {
      const defaultWorkingHours = {
        monday: { start: "08:00", end: "22:00", available: true },
        tuesday: { start: "08:00", end: "22:00", available: true },
        wednesday: { start: "08:00", end: "22:00", available: true },
        thursday: { start: "08:00", end: "22:00", available: true },
        friday: { start: "08:00", end: "22:00", available: true },
        saturday: { start: "08:00", end: "22:00", available: true },
        sunday: { start: "08:00", end: "22:00", available: true },
      };

      const currentWorkingHours = barber.workingHours || defaultWorkingHours;
      const updatedWorkingHours = { ...defaultWorkingHours };

      for (const day of Object.keys(defaultWorkingHours)) {
        updatedWorkingHours[day] = {
          start:
            (workingHours[day] && workingHours[day].start) ||
            (currentWorkingHours[day] && currentWorkingHours[day].start) ||
            defaultWorkingHours[day].start,
          end:
            (workingHours[day] && workingHours[day].end) ||
            (currentWorkingHours[day] && currentWorkingHours[day].end) ||
            defaultWorkingHours[day].end,
          available:
            workingHours[day] && workingHours[day].available !== undefined
              ? workingHours[day].available
              : currentWorkingHours[day]
              ? currentWorkingHours[day].available
              : defaultWorkingHours[day].available,
        };
      }
      barber.workingHours = updatedWorkingHours;
    }

    // Image upload/update logic
    if (req.files && req.files.image) {
      // Delete old image from cloudinary if exists
      if (barber.image && barber.image.public_id) {
        await deleteFromCloudinary(barber.image.public_id);
      }
      // Upload new image
      const uploadedImage = await fileUploadToCloudinary(req.files.image, "Saloon/user-profile");
      barber.image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    await barber.save();

    res.status(200).json({
      message: "Barber updated successfully",
      user: {
        _id: barber._id,
        name: barber.name,
        email: barber.email,
        accountType: barber.accountType,
        saloonId: barber.saloonId,
        workingHours: barber.workingHours,
        image: barber.image,
      },
    });
  } catch (error) {
    console.error("Error updating barber:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




//barber register completed booking modules starts from tomarrow 31-07-2025