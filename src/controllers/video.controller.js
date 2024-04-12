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
  const thumbnailFile = req.file?.path

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

  //find video
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
    throw new ApiError(500, "Something went wrong updating video details")
  }

  //return res
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { updateDetails },
        "Video details update successfully!"
      )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id

  const { videoId } = req.params

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "this video id is not valid !!")
  }

  const video = await Video.findById({
    _id: videoId,
  })

  if (!video) {
    throw new ApiError(404, "Video is not found!!")
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(200, video, "video fetched successfully!"))
})

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination

  const {
    // If 'page' exists in req.query, its value is assigned to the 'page' variable. If it doesn't exist, 'page' is assigned a default value of 1.
    page = 1,

    // If 'limit' exists in req.query, its value is assigned to the 'limit' variable. If it doesn't exist, 'limit' is assigned a default value of 10.
    limit = 10,

    // If 'query' exists in req.query, its value is assigned to the 'query' variable. If it doesn't exist, 'query' is assigned a default value of `/^video/`.
    query = `/^video/`,

    // If 'sortBy' exists in req.query, its value is assigned to the 'sortBy' variable. If it doesn't exist, 'sortBy' is assigned a default value of "createdAt".
    sortBy = "createdAt",

    // If 'sortType' exists in req.query, its value is assigned to the 'sortType' variable. If it doesn't exist, 'sortType' is assigned a default value of 1.
    sortType = req.query.sortType ? parseInt(req.query.sortType) : 1,
    // 'userId' is assigned the value of 'req.user._id'. Note that there's no default value here, so if 'req.user._id' is undefined, 'userId' will also be undefined.
    userId = req.user._id,
  } = req.query
  //find user in db
  const user = await User.findById({
    _id: userId,
  })

  if (!user) {
    throw new ApiError(404, "User not found!!")
  }

  // This is a MongoDB aggregation pipeline that is used to fetch videos based on certain criteria
  const getAllVideosAggreagate = await Video.aggregate([
    {
      // The $match stage filters the documents to pass only the documents that match the specified condition(s) to the next pipeline stage.
      $match: {
        // This line matches videos where the videoOwner field is equal to the userId
        videoOwner: new mongoose.Types.ObjectId(userId),
        // This line matches videos where the title or description fields contain the query string
        $or: [
          {
            title: { $regex: query, $options: "i" },
          },
          {
            description: { $regex: query, $options: "i" },
          },
        ],
      },
    },
    {
      // The $sort stage sorts the documents. The sort order is determined by the value of 'sortBy' and 'sortType'
      $sort: {
        [sortBy]: sortType,
      },
    },
    {
      // The $skip stage skips a specified number of documents. It is used here for pagination.
      $skip: (page - 1) * limit,
    },
    {
      // The $limit stage limits the number of documents in the aggregation pipeline. It is used here for pagination.
      $limit: parseInt(limit),
    },
  ])
  // This line paginates the results of the aggregation
  Video.aggregatePaginate(getAllVideosAggreagate, { page, limit })
    .then((result) => {
      // If the aggregation and pagination are successful, a 200 status code and the results are returned
      return res
        .status(201)
        .json(new ApiResponse(200, result, "Fetched all videos successfully!!"))
    })
    .catch((error) => {
      // If there is an error during the aggregation or pagination, the error is logged and thrown
      console.log("getting error while fetching all videos", error)
      throw error
    })
})

const deleteVideo = asyncHandler(async (req, res) => {
  // Extract the videoId from the request parameters.
  // Check if the videoId is a valid MongoDB ObjectId. If it's not, throw an error.
  // Find the video in the database using the videoId. If the video is not found, throw an error.
  // Check if the owner of the video matches the user making the request. If they don't match, throw an error.
  // If the video has a videoFile, delete it from Cloudinary (a cloud-based image and video management service).
  // If the video has a thumbnail, delete it from Cloudinary.
  // Delete the video from the database. If the deletion is unsuccessful, throw an error.
  // Return a response with a status code of 201 and a message indicating that the video and files were deleted successfully.

  const { videoId } = req.params

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "this video id is not valid")
  }

  const video = await Video.findById({
    _id: videoId,
  })

  if (!video) {
    throw new ApiError(404, "Video or file not found!!")
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      400,
      "you do not have to permission to delete video or file!!"
    )
  }

  if (video?.videoFile) {
    await deleteOnCloudinary(video?.videoFile?.public_id, "video")
  }
  if (video?.thumbnail) {
    deleteOnCloudinary(video?.thumbnail?.public_id, "any")
  }

  const deleteResponse = await Video.findByIdAndDelete(videoId)

  if (!deleteResponse) {
    throw new ApiError(
      400,
      "Something went wrong while deleting file or video!!"
    )
  }

  //return res
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        deleteResponse,
        "video or file delete successfully!!"
      )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "this video is is not valid!!")
  }

  //find video in db
  const video = await Video.findById({
    _id: videoId,
  })

  if (!video) {
    throw new ApiError(404, " video is not found!!")
  }

  if (video?.owner?.toString() !== req.user._id?.toString()) {
    throw new ApiError(400, "You don't have permission to toggle this video!!")
  }

  //toggle video status
  video.isPublished = !video.isPublished

  await video.save({ validateBeforeSave: false })

  return res
    .status(201)
    .json(new ApiResponse(
      200,
      video,
      "toggle video successfully!!!"
    ))
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
}
