import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//create Tweet
const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body

  if (!content || content?.trim() === "") {
    throw new ApiError(500, "Content is required")
  }

  //creating tweet
  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  })

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating tweet")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully!!!"))
})

//get all tweets
const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets compeleted
  const { userId } = req.params

  if (!isValidObjectId(userId)) {
    throw new ApiError(500, "This user id is not valid")
  }

  //find User in database
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(404, "User is not found!!")
  }

  //match and find their all tweets
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: user._id,
      },
    },
  ])

  if (!tweets) {
    throw new ApiError(500, "Somthing went wrong while fetching tweets")
  }

  //return response
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
  //TODO update tweet

  const { newContent } = req.body
  const { tweetId } = req.params

  if (!newContent || !newContent?.trim() === "") {
    throw new ApiError(400, "Content is requied")
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "this tweet id is not valid")
  }

  const tweet = await Tweet.findById(tweetId)

  if (!tweet) {
    throw new ApiError(404, "this tweet is not found")
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You dont have permission to update this tweet!!")
  }

  const updateTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: newContent,
      },
    },
    {
      new: true,
    }
  )

  if (!updateTweet) {
    throw new ApiError(500, "Something went wrong while updateing tweet!")
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, updateTweet, "Tweet updated successfully!!"))
})

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "this tweet id is not valid !!")
  }

  const tweet = await Tweet.findById(tweetId)

  if (!tweet) {
    throw new ApiError(404, "this tweet is not found")
  }
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you dont have permission to delete this tweet")
  }

  const deleteTweet = await Tweet.deleteOne(req.user._id)

  console.log("delete successfully :", deleteTweet)

  if (!deleteTweet) {
    throw new ApiError(404, "Something went wrong while deleting this tweet!!")
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(200, deleteTweet, "Tweet delete successfully!!"))
})

export { createTweet, getUserTweets, updateTweet, deleteTweet }
