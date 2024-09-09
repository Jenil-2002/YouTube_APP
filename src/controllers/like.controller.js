import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  try {
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Video unliked successfully"));
    } else {
      const newLike = new Like({
        video: videoId,
        likedBy: userId,
      });
      await newLike.save();
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Video liked successfully"));
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while toggling the like on the video",
      error: error.message,
    });
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    const existingLike = await Like.findOne({
      comment: commentId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment unliked successfully"));
    } else {
      const newLike = new Like({
        comment: commentId,
        likedBy: userId,
      });
      await newLike.save();
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment liked successfully"));
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while toggling the like on the comment",
      error: error.message,
    });
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  try {
    const existingLike = await Like.findOne({
      tweet: tweetId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Tweet unliked successfully"));
    } else {
      const newLike = new Like({
        tweet: tweetId,
        likedBy: userId,
      });
      await newLike.save();
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Tweet liked successfully"));
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while toggling the like on the Tweet",
        error: error.message,
      });
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming the authenticated user ID is stored in req.user

  try {
    // Find all likes by the user and populate the video details
    const likedVideos = await Like.find({ likedBy: userId })
      .populate("video")
      .exec();

    // Extract the video details from the likes
    const videos = likedVideos.map((like) => like.video);

    return res.status(200).json(new ApiResponse(200, videos));
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while retrieving liked videos",
        error: error.message,
      });
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
