import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)

app.use(
  express.json({
    limit: "20kb",
  })
)
app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
)
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import likeRouter from "./routes/like.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)
//http://localhost:8000/api/v1/users/register
app.use("/api/v1/tweets", tweetRouter)
//http://localhost:8000/api/v1/tweets
app.use("/api/v1/videos", videoRouter)
//http://localhost:8000/api/v1/videos
app.use("/api/v1/comments", commentRouter)
//http://localhost:8000/api/v1/comments
app.use("/api/v1/playlist", playlistRouter)
//http://localhost:8000/api/v1/playlist
app.use("/api/v1/likes", likeRouter)
//http://localhost:8000/api/v1/likes
app.use("/api/v1/dashboard", dashboardRouter)
//http://localhost:8000/api/v1/dashboard
app.use("/api/v1/subscription", subscriptionRouter)
//http://localhost:8000/api/v1/subscription
app.use("/api/v1/healthcheck",healthcheckRouter)

export { app }
