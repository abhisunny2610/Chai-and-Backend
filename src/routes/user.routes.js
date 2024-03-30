import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    changeCurrentPassword, getCurrentUser, loginUser, logoutUser,
    refreshAccessToken, registerUser, updateUserAvatar, updateUserDetails
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
router.route("/update-user-avatar").post(verifyJWT, upload.fields({name:"avatar"}), updateUserAvatar)


export default router
