import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    changeCurrentPassword, getCurrentUser,
    getUserChannelProfile, getWatchHistory,
    loginUser, logoutUser,
    refreshAccessToken, registerUser,
    updateUserAvatar, updateUserCoverImage,
    updateUserDetails
} from "../controllers/user.controller.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser)

router.route("/login").post(loginUser)

// secure routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-user-details").patch(verifyJWT, updateUserDetails)

router.route("/update-user-avatar").patch(verifyJWT,
    upload.single("avatar"), updateUserAvatar)
router.route("/update-user-coverImage").patch(verifyJWT,
    upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router
