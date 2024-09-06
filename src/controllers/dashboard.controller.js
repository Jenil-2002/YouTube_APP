import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;

    // Total number of videos
    const totalVideos = await Video.countDocuments({ owner: userId });

    // Total views and total likes
    const totalViewsStats = await Video.aggregate([
        { $match: { owner: userId } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
            }
        }
    ]);

    const totalViews = totalViewsStats.length ? totalViewsStats[0].totalViews : 0;

    // Total likes for all videos owned by the user
    const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: userId }).distinct('_id') } });

    // Assuming you have a "subscribers" field in your User schema
    const totalSubscribers = user.subscribers;

    // Return the aggregated statistics
    res.status(200).json({
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers
    });
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats,
    getChannelVideos
}