import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user._id; // Assuming the authenticated user ID is stored in req.user

  try {
    // Create a new playlist document
    const newPlaylist = new Playlist({
      name,
      description,
      videos: [],
      owner: ownerId,
    });

    await newPlaylist.save();

    return res.status(201).json(new ApiResponse(201, newPlaylist));
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the playlist",
      error: error.message,
    });
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const playlists = await Playlist.find({ owner: userId });

    if (!playlists) {
      throw new ApiError(404, "playlists not found");
    }
    return res.status(200).json(new ApiResponse(200, playlists));
  } catch (error) {
    // throw new ApiError(500, "Error retrieving playlist");
    res
      .status(500)
      .json({ message: "Error retrieving playlists", error: error.message });
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, "playlist not found");
    }
    return res.status(200).json(new ApiResponse(200, playlist));
  } catch (error) {
    // throw new ApiError(500, "Error retrieving playlist");
    res
      .status(500)
      .json({ message: "Error retrieving playlist", error: error.message });
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.videos.includes(videoId)) {
      return res.status(400).json({ message: "Video already in the playlist" });
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video added to the playlist"));
  } catch (error) {
    res.status(500).json({
      message: "Error adding video to playlist",
      error: error.message,
    });
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const videoIndex = playlist.videos.indexOf(videoId);
    if (videoIndex === -1) {
      return res
        .status(404)
        .json({ message: "Video not found in the playlist" });
    }

    playlist.videos.splice(videoIndex, 1);
    await playlist.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video removed from the playlist"));
  } catch (error) {
    res.status(500).json({
      message: "Error removing video from playlist",
      error: error.message,
    });
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Playlist deleted successfully"));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting playlist", error: error.message });
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating playlist", error: error.message });
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
