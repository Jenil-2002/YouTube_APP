import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    return res.status(400).json({ message: "Tweet content is required" });
  }

  try {
    const newTweet = new Tweet({
      content,
      owner: userId,
    });

    const savedTweet = await newTweet.save();

    return res
      .status(201)
      .json(new ApiResponse(201, savedTweet, "Tweet added successfully"));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding tweet", error: error.message });
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const tweets = await Tweet.find({
      owner: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweet fetched successfully"));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retriving tweets", error: error.message });
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  try {
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found." });
    }

    if (content) tweet.content = content;
    const updatedTweet = await tweet.save();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating tweets", error: error.message });
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  try {
    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found." });
    }
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet deleted successfully"));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting tweets", error: error.message });
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
