import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description, isPublished = true } = req.body

  if (!title || title?.trim() === "") {
    throw new ApiError(400, "title content is required!!!")
  }
  if (!description || description?.trim() === "") {
    throw new ApiError(400, "Description is required!!")
  }

  console.log(req.files)

  //local path
  const videoFileLocalPath = req.files?.videoFile?.[0].path
  const thumbnailFileLocalPath = req.files?.thumbnail?.[0].path

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is missing!!")
  }

  //upload On Cloudinary
  const videoFile = await uploadOnCloudinary(videoFileLocalPath)
  const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath)

  if (!videoFile) {
    throw new ApiError(
      500,
      "something went wrong while uploading video file on cloudinary"
    )
  }

  //save in db
  const video = await Video.create({
    videoFile: {
      public_id: videoFile?.public_id,
      url: videoFile?.url,
    },
    thumbnail: {
        public_id: thumbnailFile?.public_id,
        url: thumbnailFile?.url,
      },
      title,
      description,
      isPublished,
      videoOwner: req.user._id,
      duration : videoFile?.duration
  })
    
    if (!video) {
        throw new ApiError(500,"something went wrong while storing video in database")
    }

    //return res
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                video,
                "video uploaded successfully!!"
            )
        )
})



const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
}
