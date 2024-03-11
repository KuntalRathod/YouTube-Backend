import { Router } from "express"
import {
  addCommentToVideo,
  addCommentToTweet,
  getVideoComments,
  getTweetComments,
  updateCommentToVideo,
  updateCommentToTweet,
  deleteCommentToVideo,
  deleteCommentToTweet,
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file
router.route("/video/:videoId").get(getVideoComments).post(addCommentToVideo)
router.route("/tweet/:tweetId").get(getTweetComments).post(addCommentToTweet)

router
  .route("/video/c/:commentId")
  .delete(deleteCommentToVideo)
  .patch(updateCommentToVideo)
router
  .route("/tweet/c/:commentId")
  .delete(deleteCommentToTweet)
  .patch(updateCommentToTweet)

export default router
