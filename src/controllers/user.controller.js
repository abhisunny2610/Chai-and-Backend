import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body

    if ([fullName, username, email, password].some((field) =>
        field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullName: fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: email,
        password: password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

export { registerUser }


/*
    REGISTER USER STEPS
    --> Get all the required user details from frontend
    --> Validation - all required are complasiory
    --> check if user already exists -- username, email
    --> check for avatar
    --> upload avatar on cloudinary
    --> check avatar is successfully saved on cloudinary or not
    --> create user object and save the details in database
    --> remove password and refresh token field from response
    --> check for user creation
    --> return response
*/