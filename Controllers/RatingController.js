const Review=require("../Models/Rating")
const Saloon=require("../Models/Saloon")

const createReview = async (req, res) => {
  try {
    const { saloonId, rating, review } = req.body;
    const userId = req.user.id; 
    const userName = req.user.name;

    if (!saloonId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Saloon ID and rating are required",
      });
    }

    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Saloon not found",
      });
    }

    const alreadyReviewed = saloon.reviews.some(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this saloon",
      });
    }


    const newReview = await Review.create({
      saloonId,
      user: userId,
      rating,
      review,
    });


    saloon.reviews.push({
      user: userId,
      name: userName,
      rating,
      comment: review,
    });


    const totalRating = saloon.reviews.reduce((sum, r) => sum + r.rating, 0);
    saloon.ratings = totalRating / saloon.reviews.length;
    saloon.numReviews = saloon.reviews.length;

    await saloon.save();

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: newReview,
    });
  } catch (err) {
    console.error("Review creation error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the review",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, review } = req.body;

    if (!rating) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update" });
    }


    const existingReview = await Review.findOne({
      _id: reviewId,
      user: userId,
    });
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    if (rating) existingReview.rating = rating;
    if (review) existingReview.review = review;

    await existingReview.save();

  
    const saloon = await Saloon.findById(existingReview.saloonId);

    const embeddedReview = saloon.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );
    if (embeddedReview) {
      if (rating) embeddedReview.rating = rating;
      if (review) embeddedReview.comment = review;
    }

   
    const totalRating = saloon.reviews.reduce((sum, r) => sum + r.rating, 0);
    saloon.ratings = totalRating / saloon.reviews.length;
    await saloon.save();
    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      updatedReview: existingReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating review",
    });
  }
};
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    
    const existingReview = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    const saloonId = existingReview.saloonId;


    await Review.deleteOne({ _id: reviewId });


    const saloon = await Saloon.findById(saloonId);

    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Associated saloon not found",
      });
    }
    saloon.reviews = saloon.reviews?.filter(
      (r) => r.user.toString() !== userId.toString()
    ) || [];

    const totalRating = saloon.reviews.reduce((sum, r) => sum + r.rating, 0);
    saloon.numReviews = saloon.reviews.length;
    saloon.ratings =
      saloon.numReviews === 0 ? 0 : totalRating / saloon.numReviews;

 
    await saloon.save();

   
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting review",
    });
  }
};


const getAllReviewsForSaloon = async (req, res) => {
  try {
    const { saloonId } = req.params;
    // console.log(productId);
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(saloonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!saloonId) {
      return res.status(401).json({
        success: false,
        message: "saloon Id not Found",
      });
    }

    // Check if the product exists
    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Saloon not found",
      });
    }

    // Get all reviews for the product
    const reviews = await Review.find({ saloonId })
      .populate("user", "name email") // populate user info
      .sort({ createdAt: -1 }); // latest reviews first

    return res.status(200).json({
      success: true,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching reviews",
    });
  }
};

const deleteReviewBysaloon = async (req, res) => {
  try {
    const {reviewId} = req.params;

    // 1. Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const saloonId = review.saloonId;
    const userId = review.user;

    // 2. Delete the review from Review collection
    await Review.findByIdAndDelete(reviewId);

    // 3. Find the saloon and update its reviews array
    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Associated saloon not found",
      });
    }

    // 4. Remove the user's review from saloon's embedded reviews array
    saloon.reviews = saloon.reviews?.filter(
      (r) => r.user.toString() !== userId.toString()
    ) || [];

    // 5. Recalculate saloon ratings
    const totalRating = saloon.reviews.reduce((sum, r) => sum + r.rating, 0);
    saloon.numReviews = saloon.reviews.length;
    saloon.ratings =
      saloon.numReviews === 0 ? 0 : totalRating / saloon.numReviews;

    // 6. Save the updated saloon
    await saloon.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully by admin",
    });
  } catch (error) {
    console.error("Error in deleteReviewBysaloon controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting review",
    });
  }
};


module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsForSaloon,
 
  deleteReviewBysaloon
};
