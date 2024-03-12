import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something wents wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body
    if ([fullName, username, email, password].some((field) =>
        field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

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

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    if (!email || !username) {
        throw new ApiError(400, "username or email required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!existedUser) {
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await existedUser.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id)

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie.status("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

export { registerUser, loginUser, logoutUser }


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


    LOGIN USER STEPS
    --> Get (email or username) and password from frontend
    --> Find user in database
    --> Validate user
    --> Hash the password
    --> generate access and refresh token
    --> send the cookies 
    --> return success message 
*/