import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js"

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
      url: thumbnailFile?.url || "",
    },
    title,
    description,
    isPublished,
    videoOwner: req.user._id,
    duration: videoFile?.duration,
  })

  if (!video) {
    throw new ApiError(
      500,
      "something went wrong while storing video in database"
    )
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(200, video, "video uploaded successfully!!"))
})

//update video details
const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params
  const { title, description } = req.body
  const thumbnailFile = req.path?.url

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "this video id is not valid")
  }

  //if any field is not provide
  if (
    !(
      thumbnailFile ||
      !(!title || title?.trim() === "") ||
      !(!description || description?.trim() === "")
    )
  ) {
    throw new ApiError(400, "update fields are required!")
  }

  const previousVideo = await Video.findOne({
    _id: videoId,
  })

  if (!previousVideo) {
    throw new ApiError(404, "video not found!")
  }

  let updateFields = {
    $set: {
      title,
      description,
    },
  }

  // if thumbnail provided delete the previous one and upload new on
  let thumbnailUploadOnCloudinary
  if (thumbnailFile) {
    await deleteOnCloudinary(previousVideo?.thumbnail?.public_id)

    //Now upload the new one
    thumbnailUploadOnCloudinary = await uploadOnCloudinary(thumbnailFile)

    if (!thumbnailUploadOnCloudinary) {
      throw new ApiError(
        500,
        "something went wrong while uploading the thumbnail file on cloudinary!!"
      )
    }

    updateFields.$set = {
      public_id: thumbnailUploadOnCloudinary?.public_id,
      url: thumbnailUploadOnCloudinary?.url,
    }
  }

  //save in db
  const updateDetails = await Video.findByIdAndUpdate(videoId, updateFields, {
    new: true,
  })

  if (!updateDetails) {
    throw new ApiError(500,"Something went wrong updating video details")
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(
      200,
      {updateDetails},
      "Video details update successfully!"
    ))
})

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id
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
