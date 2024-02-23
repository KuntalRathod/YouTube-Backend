import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//access and refresh token generate function
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    //Assigning the refresh token to the user instance
    user.refreshToken = refreshToken

    //encoded wala refresh token
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    )
  }
}

//register user
const registerUser = asyncHandler(async (req, res) => {
  //1. get user details from frontend
  //2. validation - not empty
  //3. check if user already exists: username,email
  //4. check for images for avatar
  //5. upload them to cloudinary ,avatar
  //6. create user object - create entry in db
  //7. remove password and refresh token field from response
  //8. check for user creation
  //9. return response

  const { fullName, email, username, password } = req.body
  console.log("email: ", email)

  // if (fullName === "") {
  //   throw new ApiError(400,"Full name is required !!")
  // }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required !!!")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  })

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }

  console.log(req.files)

  const avatarLocalPath = req.files?.avatar[0]?.path
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //imporved Code
  let coverImageLocalPath

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  // if avatar file is not received
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar files is required")
  }

  //upload in cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar files is required")
  }

  //store in database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  })

  // remove password and refresh token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  // return the response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"))
})

//login user
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // validation -> not empty*
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send secure cookies
  // res succussfully login !!

  const { email, username, password } = req.body
  console.log(email)

  // if (!(username || email)) { //dono mein se ek chahiye uske liye
  //   throw new ApiError(400, "username or email is required");
  // }

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  })

  if (!user) {
    throw new ApiError(404, "user does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password) //password thik hoga toh true or false value aayegi

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  // generating access and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id)

  //send in cookie
  const LoggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  //return response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: LoggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    )
})

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, //This removes field from document
      },
    },
    {
      new: true,
    }
  )
  const options = {
    httpOnly: true,
    secure: true,
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        {}, //data we send empty bez we dont need
        "User logged Out Successfully!!"
      )
    )
})

// refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    // match token
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used")
    }
    const options = {
      httpOnly: true,
      secure: true,
    }

    // generating new refresh access token
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed successfully"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

//change password function
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  // if (!(newPassword === confPassword)) {
  //   throw new ApiError()
  // }

  const user = await User.findById(req.user?._id)

  // check provided oldPassword is correct or not
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
  }

  // set the password
  user.password = newPassword

  // save the password
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

//get Current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

//updateAccountDetails
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body
  if (!(fullName || email)) {
    throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

//update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path //local pein multer ne upload kaar di hogii

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing")
  }

  //delete privious avatar file on cloudinary
  // const user = await User.findById(req.user?._id).select(
  //   "-password -refreshToken"
  // )

  //upload in cloudinary and get a url file so
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  //check avatar
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image updated successfully"))
})

//update usercover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path //local pein multer ne upload kaar di hogii

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading coverImage")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"))
})

// get user Channel  profile function
const getUserChannelProfile = asyncHandler(async (req, res) => {
  //getting data from url
  const { username } = req.params
  if (!username?.trim()) {
    throw new ApiError(400, "User is missing")
  }
  //TODO: aggregate pipeline it returns an array
  const channel = await User.aggregate([
    // match the value
    // pipeline stage 1
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    // stage 2 lookup all the sabscribers value
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel", //channel ko select kar liya hai toh apko milenge subscribers
        as: "subscribers",
      },
    },
    // stage 3 loolup all the subscribe to value that user subscribed
    {
      $lookup: {
        from: "subscriptions", // because its store in database lowercase and purals form
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo", //meine kisko subscribed kaar rakha haai
      },
    },
    //add this two different fields
    // stage 4 addfeilds and count value
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        //TODO: $in: means prensent hai yaa nhi haai
        // AND In object ke andar ja ke bhi dekh leta hai aur array bhi

        //check user subscribed or not
        isSubscribed: {
          $condi: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    //projection deta hai ki mein saari value ko mein vha pein projct nhi karunga vha pein jo bhi usko demand kar rha hai usko mein selected chize hi dunga
    // stage 5 i want only selected value
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ])
  console.log(channel)
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})

// get watch history function
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    //stage 1  matching id feild to object id of current user
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
        // bez mongodb id a proper way like 'ObjectId('string')' but in aggregate function all code gose as a some so mongoose can't convert this so we convert like this kiuki hame req.user._id se string value recive hoti hai jo ki kafi nahi hai match karne ke liye
      },
    },
    //stage 2 lookup from videos database to get all videos id in my users local feild

    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          // adding another pipeline (nasted lookup)
          //stage 1 lookup from users
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                // this nested pipeline add the value that i need in videoOwner feild
                // stage 1 dont need all vlaue want only specific value
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
                // stage 2 get data in object format
                {
                  $addFields: {
                    //existing field override thy jaay
                    // i want overwrite the existing value thats why same name
                    owner: {
                      //frontend ko direct object mil jayega aur usme dot krke sari values nikal legaa!
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully"
      )
    )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
}
