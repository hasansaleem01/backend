import {v2 as cloudinary } from "cloudinary"   
import fs from "fs";

cloudinary.config({ 
  cloud_name: 'hrsjpepc', 
  api_key: '947133175781788', 
  api_secret: 'mcQ2IkknCUhbBvF7NbS7NSamadI'
});
const uploadonCloudinary = async (localFilePath) => {
try {
   if(!localFilePath) return null
   //upload files 
   const response = await cloudinary.uploader.upload(localFilePath,{
    resource_type: "auto"
   })
   // file has been uploaded successfully
   console.log("file is uploaded on cloudinary", response.url);
   return response;
} catch (error) {
  fs.unlinkSync(localFilePath) // remove the locally saved temporrary saved files as the upload operation gets failed
}
}
cloudinary.v2.uploader
.upload("dog.mp4", {
  resource_type: "video", 
  public_id: "my_dog",
  overwrite: true, 
  notification_url: "https://mysite.example.com/notify_endpoint"})
.then(result=>console.log(result));