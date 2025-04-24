import { v2 as cloudinary } from "cloudinary";

// If you set CLOUDINARY_URL, you don't need to configure each value separately
// The SDK will parse it automatically.
cloudinary.config({
  secure: true,
  // If you prefer, you can also do:
//  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//  api_key:    process.env.CLOUDINARY_API_KEY,
//  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;