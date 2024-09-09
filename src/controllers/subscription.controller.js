import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  try {
    const existingSubscription = await Subscription.findOne({
      subScriber: subscriberId,
      channel: channelId,
    });

    if (existingSubscription) {
      await Subscription.findByIdAndDelete(existingSubscription._id);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
      await Subscription.create({
        subScriber: subscriberId,
        channel: channelId,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Subscribed successfully"));
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling subscription", error: error.message });
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    const subscribers = await Subscription.find({
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
      );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching subscribers", error: error.message });
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  try {
    const subscribedChannels = await Subscription.find({
        subScriber: subscriberId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
      );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching subscribed channels", error: error.message });
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
