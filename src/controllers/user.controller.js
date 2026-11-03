import {asyncHandler} from  "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt  from "jsonwebtoken"
const generateAccessandRefreshToken = async(userId){
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()


     user.refreshToekn = refreshToken
     await user.save({validateBeforeSave : false})

    return {accessToken, refreshToken}


  } catch (error) {
    throw new ApiError(500, "Something went wrong while creating access and refresh tokens")
  }
}

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

const existingUser = await User.findOne({
    $or: [{ username }, { email }]
})

if(existingUser){
    throw new ApiError(409, "User already existing in databse");
}

const avatarLocalPath = req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverimage[0]?.path;

if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
}
 
 const avatar = await uploadonCloudinary(avatarLocalPath)
//  const coverImage = await uploadonCloudinary(coverImageLocalPath)


let coverImageLocalPath
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage > 0)
{
  coverImageLocalPath = req.files.coverImage[0].path;
}

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

const loginUser = asyncHandler(async(req,res) => {

  const {email, username,password} = req.body

  if(!username && !email){
    throw new ApiError(400, "username or email are required")
  }

  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if(!user){
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!PasswordValid){
    throw new ApiError(401, "Incorrect password")
  }

   const {accesToken, refreshToken} = await generateAccessandRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


     const options = {
      httpOnly : true,
      secure: true,
     }
return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
.json(
  new ApiResponse(
    200,
    {
      user: loggedInUser, accessToken, 
      refreshToken
    },
    "User logged in successfully"
  )
)


})

const logoutUser =  asyncHandler(async(req,res) => {
await User.findByIdAndUpdate(
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
      httpOnly : true,
      secure: true
     }
return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User Logged Out "))
})

const refreshAccessToken = asyncHandler(async(req,res)=> {

const incomingRefreshToken = req.cookies.refreshToken ||req.body.refreshToken
if(!incomingRefreshToken){
  throw new ApiError(401, "Unauthorized request")
}

try {
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  const user = await User.findById(decodedToken?._id)
  if(!user){
    throw new ApiError(401, "Invalid request")
  }
  if (incomingRefreshToken !== user?.refreshToken ) {
    throw new ApiError(401, "Refresh Token expired or")
  }
  const options = {
    httpOnly : true,
    secure: true
  }
  
  
  const{accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)
  
  
  return res
  .status(200)
  .cookie("accessToken",accessToken,options )
  .cookie("refreshToken", refreshToken,options)
  .json(
    new APiResponse(
      200,
      {accessToken,refreshToken: newRefreshToken}, "Access Token"
    )
  )
} catch (error) {
  throw new ApiError(401, error?.message||"Some Error occured")
}


})


const changeCurrentPassword = asyncHandler(async(req,res)=> {
  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
   throw new ApiError (400, "Invalid password")
  }


  user.password = newPassword
   await user.save({validateBeforeSave})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password Changed Successfuly."))
})



const getCurrentUser = asyncHandler(async(req,res) => {
  return res
  .status(200)
  .json(200, req.user, "current user fetched successfully")
})


const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullName,email} = req.body

  if(!fullName && !email){
    throw new ApiError(400, "All fields are temporary")
  }

  const user = User.findByIdAndUpdate(req.user?._id,
  {
   $set:{
   fullName: fullName,
    email: email
   }
  },
  {new : true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200, user, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandler(async(req,res) => {
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing. ")
  }
  const avatar = await uploadonCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400, "Avatar while uploading on avatar")

  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar : avatar.url
      }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "Avatar updated successfully")
  )
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
  const CoverImageLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Cover Image file is missing. ")
  }
  const coverImage = await uploadonCloudinary(CoverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400, "Error while uploading on cover image")

  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage : coverImage.url
      }
    },
    {new : true}
  ).select("-password")
  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "Cover Image updated succesfully ")
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
    updateUserAvatar 

}