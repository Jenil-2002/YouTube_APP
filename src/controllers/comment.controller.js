import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    try {
        // Find all comments for the specific video, with pagination
        const comments = await Comment.find({ video: videoId })
            .skip((page - 1) * limit) // Skip the documents for pagination
            .limit(parseInt(limit)) // Limit the number of documents returned
            .sort({ createdAt: -1 }); // Sort comments by creation date (newest first)

        // Get the total count of comments for the specified video
        const totalComments = await Comment.countDocuments({ video: videoId });

        const commentsData = {
            comments,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalComments / limit),
            totalComments,
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, commentsData)
            )
    } catch (error) {
        res.status(500).json({ message: "Error retrieving comments", error: error.message });
    }
})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params
    const userId = req.user._id;

    if (!content) {
        return res.status(400).json({ message: "Comment content is required" });
    }

    try {
        // Create and save the new comment
        const newComment = new Comment({
            content,
            video: videoId,
            owner: userId,
        });

        const savedComment = await newComment.save();

        return res
            .status(201)
            .json(
                new ApiResponse(201, savedComment, "Comment added successfully")
            )
    } catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;


    // Find the comment by its ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json({ message: "Comment not found." });
    }

    // Update the content
    comment.content = content;
    const updatedComment = await comment.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(500, "Comment not found");
        }
        // Find the comment by its ID and delete
        await Comment.findByIdAndDelete(commentId);
        return res
            .status(200)
            .json(
                new ApiResponse(200, null, "Comment deleted successfully")
            )
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}