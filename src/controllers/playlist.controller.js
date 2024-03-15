import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  if (
    !name ||
    name?.trim() === "" ||
    !description ||
    description?.trim() === ""
  ) {
    throw new ApiError(403, "Name and description is required!!")
  }

  //create playlist
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  })
  if (!playlist) {
    throw new ApiError(500, "something went wrong while creating playlist!")
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist created successfully!"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params

  console.log("playlistId :", playlistId)

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(403, "this playlist is not valid!!")
  }

  // Find the playlist in the database using the playlistId
  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(404, "playlist is not found!!")
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully!!"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params
  //TODO: get user playlists
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  // TODO: remove video from playlist
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body
  //TODO: update playlist
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
}
