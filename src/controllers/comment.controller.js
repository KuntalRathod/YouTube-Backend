import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"
import { Video } from "../models/video.model.js"

const addCommentToVideo = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { comment } = req.body
  const { videoId } = req.params

  console.log("comment :", comment)
  console.log("videoId : ", videoId)

  if (!comment || comment?.trim() === "") {
    throw new ApiError(400, "Comment is required")
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "This video id is not valid!!")
  }

  //save in db and create all the fields
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

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "this video id is not valid!!")
  }

  //find the video in the database
  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404, "video not found!!")
  }

  //match and find all comments
  const aggregateComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
  ])

  Comment.aggregatePaginate(aggregateComments, {
    page,
    limit,
  }).then((result) => {
    return res
      .status(201)
      .json(
        new ApiResponse(201, result, "all video comments fetched successfully")
      )
  })
})

const updateCommentToVideo = asyncHandler(async (req, res) => {
  // TODO: update a comment to Video
  const { newContent } = req.body
  const { commentId } = req.params

  if (!newContent || newContent?.trim() === 0) {
    throw new ApiError(400, "content is required!!!")
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "comment id is not valid")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, "Comment is not found!!")
  }

  if (comment?.owner.toString() !== req.user._id?.toString()) {
    throw new ApiError(403, "you dont have permission to update this comment!")
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newContent,
      },
    },
    {
      new: true,
    }
  )

  if (!updateComment) {
    throw new ApiError(
      400,
      "Something went wrong while updating this comment!!"
    )
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(200, updateComment, "Comment updated successfully!!"))
})

const deleteCommentToVideo = asyncHandler(async (req, res) => {
  // TODO: Delete a comment to Video

  const { commentId } = req.params

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "This comment id is not valid!")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, "Comment is not found!!")
  }

  if (comment?.owner?.toString() !== req.user._id?.toString()) {
    throw new ApiError(500, "you dont have permission to delete this comment!!")
  }

  const deleteComment = await Comment.deleteOne({ _id: commentId })

  if (!deleteComment) {
    throw new ApiError(
      500,
      "Something went wrong while deleting this comment!!"
    )
  }

  //return res
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        deleteComment,
        "video comment deleted successfully!!!"
      )
    )
})


const addCommentToTweet = asyncHandler(async (req, res) => {
  // TODO: add a comment to a Tweet
  const { comment } = req.body
  const { tweetId } = req.params

  console.log("comment :", comment)
  console.log("tweetId : ", tweetId)

  if (!comment || comment?.trim() === "") {
    throw new ApiError(400, "Content is required!!")
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "this tweet id is not valid!!")
  }

  //save in db and create all the fields
  const commentTweet = await Comment.create({
    content: comment,
    tweet: tweetId,
    owner: req.user._id,
  })

  if (!commentTweet) {
    throw new ApiError(500, "Something went wrong while creating tweet comment")
  }
  //return res
  return res
    .status(201)
    .json(
      new ApiResponse(200, commentTweet, "comment tweet created successfully!!")
    )
})

const getTweetComments = asyncHandler(async (req, res) => {
  // TODO: add a comment to a Tweet
  const { tweetId } = req.params
  const { page = 1, limit = 10 } = req.query

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "this tweet id is not valid!!!")
  }

  //find the tweet in the database
  const tweetComment = await Tweet.findById(tweetId)

  if (!tweetComment) {
    throw new ApiError("tweet comment is not found")
  }

  //match and find all comments
  const aggregateComments = await Tweet.aggregate([
    {
      $match: {
        tweet: new mongoose.Types.ObjectId(tweetId),
      },
    },
  ])
  Comment.aggregatePaginate(aggregateComments, {
    page,
    limit,
  }).then((result) => {
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          tweetComment,
          "tweet comments fetched succussfully!!"
        )
      )
  }).catch((error) => {
    throw new ApiError(500,"something went wrong while fetching tweet comments!, error")
  })
})

const updateCommentToTweet = asyncHandler(async (req, res) => {
  // TODO: update a comment to Tweet
  const { newContent } = req.body
  const { commentId } = req.params

  if (!newContent || newContent?.trim() === "") {
    throw new ApiError(400, "new content is required!!")
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "this comment id is not valid")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, "This tweet is not found!!!")
  }

  if (comment?.owner?.toString() !== req.user._id?.toString()) {
    throw new ApiError(403, "you dont have permission to update this comment!!")
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newContent,
      },
    },
    {
      new: true,
    }
  )

  if (!updateComment) {
    throw new ApiError(
      403,
      "something went wrong while updating this comment!!"
    )
  }

  //return res
  return res
    .status(201)
    .json(
      new ApiResponse(200, updateComment, "comment updated successfully!!!")
    )
})

const deleteCommentToTweet = asyncHandler(async (req, res) => {
  // TODO: Delete a comment to tweet
  const { commentId } = req.params

  if (!isValidObjectId(commentId)) {
    throw new ApiError(403,"this is comment id is not valid!!")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404,"comment not found!!")
  }

  if (comment?.owner?.toString() !== req.user._id?.toString()) {
    throw new ApiError(500,"you dont have permission to delete this tweet comment!!")
  }

  const deletetweet = await Comment.deleteOne({ _id: commentId })

  if (!deletetweet) {
    throw new ApiError(403,"something went wrong while deleting this comment tweet!!")
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(
      200,
      deletetweet,
      "tweet comment deleted successfully!!!"
    ))
  
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
