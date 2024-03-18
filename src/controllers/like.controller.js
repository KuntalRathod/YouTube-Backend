import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//like or unlike video
const toggleVideoLikeAndUnlike = asyncHandler(async (req, res) => {
  // Extract videoId from request parameters
  const { videoId } = req.params

  if (isValidObjectId(videoId)) {
    throw new ApiError(403, "this video id is not valid!!")
  }

  //find video already like or not
  const videoLike = await Like.findOne({
    video: videoId,
  })

  let like
  let unlike

  // If the video is already liked
  if (videoLike) {
    // Remove the like
    unlike = await Like.deleteOne({
      video: videoId,
    })

    if (!unlike) {
      throw new ApiError(500, "somethig went wrong while unlike video!!")
    }
  } else {
    // If the video is not already liked, add a like
    like = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    })

    if (!like) {
      throw new ApiError(500, "something went wrong while like video !!")
    }
  }

  // Return a response indicating whether the video was liked or unliked
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        {},
        `User ${like ? "like" : "Unlike"} video successfully!!`
      )
    )
})

//like or unlike comment
const toggleCommentLikeAndUnlike = asyncHandler(async (req, res) => {
  const { commentId } = req.params

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "this comment id is not valid!!")
  }

  //find the comment already like or not
  const commentLike = await Like.findOne({
    comment: commentId,
  })

  let like
  let unlike

  if (commentLike) {
    unlike = await Like.deleteOne({
      comment: commentId,
    })

    if (!unlike) {
      throw new ApiError(500, "something went wrong while unlike comment!!")
    }
  } else {
    like = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    })
    if (!like) {
      throw new ApiError(500, "something went wrong while like comment!!")
    }
  }

  //return res
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        {},
        `User ${like? "like" : "Unlike"} comment successfully!!`
      )
    )
})

//like or unlike tweet
const toggleTweetLikeAndUnlike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params

  if (!tweetId) {
    throw new ApiError(500, "this tweet id is not valid!!")
  }

  //find tweet already like or not
  const tweetLike = await Like.findOne({
    tweet: tweetId,
  })

  let like
  let unlike

  if (tweetLike) {
    unlike = await Like.deleteOne({
      tweet: tweetId,
    })
    if (!unlike) {
      throw new ApiError(500, "something went wrong while unlike tweet!!")
    }
  } else {
    like = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    })
    if (!like) {
      throw new ApiError(500, "something went wrong while like tweet!!")
    }
  }
  
  //return res
  return res
    .status(201)
    .json(new ApiResponse(
      200,
      {},
      `User ${like? "like" : "Unlike"} tweet successfully!!`
    ))

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
