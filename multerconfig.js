import multer from "multer";
import fs from "fs";
import path from "path";

// Video storage
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/videos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `video-${Date.now()}${ext}`);
  },
});

// Image storage
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/images";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `img-${Date.now()}${ext}`);
  },
});

// Multer instance for multiple fields
export const uploadFiles = multer().fields([
  { name: "video", maxCount: 1 },
  { name: "img", maxCount: 1 },
]);

// Then in route, we manually assign storage:
export const assignFiles = (req, res, next) => {
  if (req.files?.video) {
    const file = req.files.video[0];
    const dir = "uploads/videos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filename = `video-${Date.now()}${path.extname(file.originalname)}`;
    fs.writeFileSync(path.join(dir, filename), file.buffer);
    req.files.video[0].filename = filename;
  }

  if (req.files?.img) {
    const file = req.files.img[0];
    const dir = "uploads/images";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filename = `img-${Date.now()}${path.extname(file.originalname)}`;
    fs.writeFileSync(path.join(dir, filename), file.buffer);
    req.files.img[0].filename = filename;
  }

  next();
};
