import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // Create filter and sort options
  const filter = {};
  if (query) filter.$text = { $search: query };
  // if (userId) filter.userId = userId;

  const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1 };

  // Fetch videos with pagination and sorting
  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Videos fetched successfully")
    )
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  const videoFilePath = req.files?.videoFile ? req.files.videoFile[0]?.path : null; // Get video file from request
  const thumbnailFilePath = req.files?.thumbnail ? req.files.thumbnail[0]?.path : null; // Get thumbnail file from request

  if (!videoFilePath) {
    throw new ApiError(400, "No video file provided");
  }

  if (!thumbnailFilePath) {
    throw new ApiError(400, "No thumbnail provided");
  }

  try {
    // Upload the video file to Cloudinary
    const videoUploadResult = await uploadOnCloudinary(videoFilePath);

    // Upload the thumbnail file to Cloudinary
    const thumbnailUploadResult = await uploadOnCloudinary(thumbnailFilePath);


    // Create a new video document in MongoDB
    const newVideo = await Video.create({
      videoFile: videoUploadResult.url,
      thumbnail: thumbnailUploadResult.url,
      title,
      description,
      duration: videoUploadResult.duration,
      views: 0,
      isPublished: true,
      owner: req.user._id, // Assuming you have user authentication and req.user is available
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, newVideo, "Video published successfully")
      )
  } catch (error) {
    throw new ApiError(500, "Error publishing video");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  try {
    // Find the video by ID
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, video)
      )
  } catch (error) {
    // throw new ApiError(500, "Error retrieving video");
    res.status(500).json({ message: "Error retrieving video", error: error.message });
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body; // Extract the new title and description from the request body
  const thumbnailFilePath = req.files?.thumbnail ? req.files.thumbnail[0]?.path : null;

  try {
    const thumbnailUploadResult = await uploadOnCloudinary(thumbnailFilePath);
    // Find and update the video by its ID
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          ...(title && { title }), // Set title if provided
          ...(description && { description }), // Set description if provided
          ...(thumbnailUploadResult?.secure_url && { thumbnail: thumbnailUploadResult.secure_url }), // Set new thumbnail URL if uploaded
        },
      },
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedVideo) {
      throw new ApiError(404, "Video not found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
      )
  } catch (error) {
    throw new ApiError(500, "Error updating video");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    // Find the video by ID
    const video = await Video.findById(videoId);
    if (!video) {
    throw new ApiError(500, "Video not found");
      // return res.status(404).json({ message: "Video not found" });
    }
    await Video.findByIdAndDelete(videoId);
    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Video deleted successfully")
      )
  } catch (error) {
    // throw new ApiError(500, "Error deleting video");
    res.status(500).json({ message: "Error deleting video", error: error.message });
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Toggle the isPublished status
    video.isPublished = !video.isPublished;

    await video.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, video, "Video publish status updated successfully")
      )
  } catch (error) {
    res.status(500).json({ message: "Error updating video publish status", error: error.message });
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
