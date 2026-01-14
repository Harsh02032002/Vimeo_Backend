import express from "express";
import {
  addVideo,
  updateVideo,
  deleteVideo,
  getVideo,
  addView,
  trend,
  random,
  sub,
  getAllTags,
  getByTag,
  search,
  getByType,
  getUserVideos,
} from "../controllers/video.js";
import { verifyToken } from "../verifyToken.js";
import { assignFiles,uploadFiles } from "../multerconfig.js";

const router = express.Router();

// Multer style similar to menu
router.post("/", verifyToken, uploadFiles, assignFiles, addVideo);
router.put("/:id", verifyToken, uploadFiles, assignFiles, updateVideo);



router.delete("/:id", verifyToken, deleteVideo);
router.get("/find/:id", getVideo);
router.put("/view/:id", addView);
router.get("/trend", trend);
router.get("/random", random);
router.get("/sub", verifyToken, sub);
router.get("/tags/all", getAllTags);
router.get("/tags", getByTag);
router.get("/search", search);
router.get("/type/:type", getByType);
router.get("/user/:userId", verifyToken, getUserVideos);

export default router;
