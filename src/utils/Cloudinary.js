import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null

    //upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })

    //file has been uploaded successfully
    console.log("file is uploaded on Cloudinary", response.url)
    fs.unlinkSync(localFilePath)

    return response
  } catch (error) {
    fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the operation got failed
    return null
  }
}

// Define an asynchronous function named 'deleteOnCloudinary'
const deleteOnCloudinary = async (public_id, resource_type) => {
  // If no public_id is provided, return null
  if (!public_id) return null;

  try {
    // Try to delete the resource from Cloudinary using the provided public_id and resource_type
    // cloudinary.uploader.destroy is a function provided by the Cloudinary SDK that deletes a resource
    // The function is asynchronous, so we use 'await' to wait for it to complete
    // If the deletion is successfull, the function will return a result that we then return from 'deleteOnCloudinary'
    return await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });
  } catch (error) {
    // If an error occurs during the deletion, we log the error and return null
    console.log(error);
    return null;
  }
};
export { uploadOnCloudinary, deleteOnCloudinary }
