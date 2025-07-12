import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the single upload folder exists
const uploadFolder = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
  console.log(`Created folder: ${uploadFolder}`);
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filenameWithoutExt = path.basename(file.originalname, extension);
    const safeFilename = `${filenameWithoutExt}-${timestamp}${extension}`;
    cb(null, safeFilename);
  },
});

// Export upload middleware (limit: 10MB)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;
