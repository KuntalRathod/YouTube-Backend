import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"

const addCommentToVideo = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { comment } = req.body
  const { videoId } = req.params

  console.log("comment :", comment)
  console.log("videoId : ", videoId)

  if (!comment || comment?.trim() === "") {
    throw new ApiError(400, "comment is required")
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "This video id is not valid!!")
  }

  const videoComment = await Comment.create({
    content: comment,
    video: videoId,
    owner: req.user._id,
  })

  if (!videoComment) {
    throw new ApiError(500, "something went wrong while creating video comment")
  }

  //return res
  return res
    .status(201)
    .json(
      new ApiResponse(200, videoComment, "video comment created successfully!!")
    )
})

const addCommentToTweet = asyncHandler(async (req, res) => {
  // TODO: add a comment to a Tweet
  const { comment } = req.body
  const { tweetId } = req.params

  console.log("comment :", comment)
  console.log("tweetId : ", tweetId)

  if (!content || content?.trim() === "") {
    throw new ApiError(400, "Content is required!!")
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "this tweet id is not valid!!")
  }

  const commentTweet = await Tweet.create({
    content: comment,
    tweetId: tweetId,
    owner: req.user._id
  })

  if (!commentTweet) {
    throw new ApiError(500,"Something went wrong while creating tweet comment")
  }
  //return res
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        commentTweet,
        "comment tweet created successfully!!"
      ))
})

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  // if (!isValidObjectId(videoId)) {
  //     throw new ApiError(400,"this video id is not valid!!")
  // }
})

const getTweetComments = asyncHandler(async (req, res) => {
  // TODO: add a comment to a Tweet
})

const updateCommentToVideo = asyncHandler(async (req, res) => {
  // TODO: update a comment to Video
})

const updateCommentToTweet = asyncHandler(async (req, res) => {
  // TODO: update a comment to Tweet
})

const deleteCommentToVideo = asyncHandler(async (req, res) => {
  // TODO: delete a comment to Video
})

const deleteCommentToTweet = asyncHandler(async (req, res) => {
  // TODO: delete a comment to Tweet
})

export {
  addCommentToVideo,
  addCommentToTweet,
  getVideoComments,
  getTweetComments,
  updateCommentToVideo,
  updateCommentToTweet,
  deleteCommentToVideo,
  deleteCommentToTweet,
}
