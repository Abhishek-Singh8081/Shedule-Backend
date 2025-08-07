const Info = require("../Models/Information");

// CREATE CONTROLLER
exports.createinfo = async (req, res) => {
  try {
    let {
      heading,
      address,
      phone1,
      phone2,
      quickLinks,
      buisnessHours
    } = req.body;

    // Parse if quickLinks is sent as stringified JSON
    if (typeof quickLinks === "string") {
      try {
        quickLinks = JSON.parse(quickLinks);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for quickLinks.",
        });
      }
    }

    if (typeof buisnessHours === "string") {
      try {
        buisnessHours = JSON.parse(buisnessHours);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for buisnessHours.",
        });
      }
    }

    // Validate required fields
    if (!address || !phone1) {
      return res.status(400).json({
        success: false,
        message: "Address and phone1 are required fields.",
      });
    }

    // Validate max 5 quick links
    if (quickLinks && quickLinks.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can only have up to 5 quickLinks.",
      });
    }

    const information = await Info.create({
      heading,
      address,
      phone1,
      phone2,
      quickLinks,
      buisnessHours,
    });

    res.status(201).json({
      success: true,
      message: "Information created successfully.",
      data: information,
    });
  } catch (error) {
    console.error("Error in creating information:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// UPDATE CONTROLLER
exports.updateinfo = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      heading,
      address,
      phone1,
      phone2,
      quickLinks,
      buisnessHours,
    } = req.body;

    if (typeof quickLinks === "string") {
      try {
        quickLinks = JSON.parse(quickLinks);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for quickLinks.",
        });
      }
    }

    if (typeof buisnessHours === "string") {
      try {
        buisnessHours = JSON.parse(buisnessHours);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for buisnessHours.",
        });
      }
    }

    // Validate max 5 quick links
    if (quickLinks && quickLinks.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can only have up to 5 quickLinks.",
      });
    }

    const existingInfo = await Info.findById(id);

    if (!existingInfo) {
      return res.status(404).json({
        success: false,
        message: "Information not found with the provided ID.",
      });
    }

    // Apply updates
    if (heading !== undefined) existingInfo.heading = heading;
    if (address !== undefined) existingInfo.address = address;
    if (phone1 !== undefined) existingInfo.phone1 = phone1;
    if (phone2 !== undefined) existingInfo.phone2 = phone2;
    if (quickLinks !== undefined) existingInfo.quickLinks = quickLinks;
    if (buisnessHours !== undefined) existingInfo.buisnessHours = buisnessHours;

    await existingInfo.save();

    res.status(200).json({
      success: true,
      message: "Information updated successfully.",
      data: existingInfo,
    });
  } catch (error) {
    console.error("Error updating information:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


// Get all information (or the first one if you're storing a single entry)
exports.getInfo = async (req, res) => {
  try {
    const info = await Info.find(); // Fetch all info documents

    if (!info || info.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No information found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Information fetched successfully.",
      data: info, // Send all (or change to info[0] if only one doc is expected)
    });
  } catch (error) {
    console.error("Error fetching information:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
