import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists (for fallback local storage)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File filter for image types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept image files only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Memory storage for Cloudinary uploads
const memoryStorage = multer.memoryStorage();

// Disk storage for fallback
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using UUID and original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// Create the memory-based multer upload instance for Cloudinary
export const upload = multer({
  storage: memoryStorage, // Store in memory for easy streaming to Cloudinary
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: fileFilter
});

// Create disk-based upload for fallback purposes
export const diskUpload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: fileFilter
});

// Helper to get the public URL for a file
export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};