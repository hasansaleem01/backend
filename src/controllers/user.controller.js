import {asyncHandler} from  "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async(req, res) => {
    // get the user details from front-end
    // validation- not empty
    // check if user already exists : check from both username and email
    // check for images, check for avatar avatar-required
    // upload them to cloudinary, avatar
    // create a user object - create entry in db
    // remove password and refreshToken field from response
    // check for user creation
    // return response

const {fullname, email, username, password}=req.body
console.log("email", email);


if (
    [fullname , email, username, password].some((field) => field?.trim() === "" )
) {
    throw new ApiError(400, "All fields are required")
}

const existingUser = User.findOne({
    $or: [{ username }, { email }]
})

if(existingUser){
    throw new ApiError(409, "User already exists");
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverimage[0]?.path;

if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
}
 
 const avatar = await uploadonCloudinary(avatarLocalPath)
 const coverImage = await uploadonCloudinary(coverImageLocalPath)

 if(!avatar){
    throw new ApiError(400, "Avatar file is required")
 }

 User.create({fullname,
    avatar: avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username : username.toLowerCase()
 })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user" )
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  )

} )

export {
    registerUser,
}