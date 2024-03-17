import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLikeAndUnlike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: toggle like on video
})

const toggleCommentLikeAndUnlike = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  //TODO: toggle like on comment
})

const toggleTweetLikeAndUnlike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  //TODO: toggle like on tweet
})

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
})

export {
  toggleVideoLikeAndUnlike,
  toggleCommentLikeAndUnlike,
  toggleTweetLikeAndUnlike,
  getLikedVideos,
}
