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

//import userRoutes
import userRouter from "./routes/user.routes.js"

//import tweetRouter
import tweetRouter from "./routes/tweet.routes.js"

//import videoRouter
import videoRouter from "./routes/video.routes.js"

//import commentRouter
import commentRouter from "./routes/comment.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)
//http://localhost:8000/api/v1/users/register
app.use("/api/v1/tweets", tweetRouter)
//http://localhost:8000/api/v1/tweets
app.use("/api/v1/videos",videoRouter)
//http://localhost:8000/api/v1/videos
app.use("/api/v1/comments", commentRouter)
//http://localhost:8000/api/v1/comments






export { app }
