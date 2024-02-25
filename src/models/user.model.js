import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
)

//arrow func mein this ka reference nhi pata hota means context nhi pta hota haii usse

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id, //usually sirf id hi send karte haai
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}

userSchema.methods.generateForgotPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex")

  // Hash the resetToken using bcrypt
  const hashedToken = await bcrypt.hash(resetToken, 10)
  //10 means  represents the number of salt rounds, and you can adjust it based on your security requirements. Higher numbers provide better security but require more computational resources.

  // Set the hashed token to the passwordResetToken property
  this.passwordResetToken = hashedToken

  // Set the expiry time (15 minutes from now)
  this.passwordResetTokenExpiry = Date.now() + 15 * 60 * 1000

  // Return the original resetToken (for external use, if needed)
  return resetToken
}

//Remember to handle asynchronous operations appropriately when calling this method, as bcrypt.hash is asynchronous and returns a Promise


export const User = mongoose.model("User", userSchema)
