import multer from "multer";

// Keep files in memory so we can stream them directly to Cloudinary
export const upload = multer({ storage: multer.memoryStorage() });