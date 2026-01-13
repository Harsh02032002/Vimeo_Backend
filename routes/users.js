import express from "express";
import { 
  updateUser, deleteUser, getUser, 
  subscribe, unsubscribe, like, dislike,
  saveVideo, shareVideo
} from "../controllers/user.js";
import { verifyToken } from "../verifyToken.js";
import { getSavedVideos } from "../controllers/user.js";
import User from "../models/User.js";

const router = express.Router();

//update user
router.put("/:id", verifyToken, updateUser);
//delete user
router.delete("/:id", verifyToken, deleteUser);
//get a user 
router.get("/find/:id", getUser);

//subscribe/unsubscribe
router.put("/sub/:id", verifyToken, subscribe);
router.put("/unsub/:id", verifyToken, unsubscribe);

//like/dislike
router.put("/like/:videoId", verifyToken, like);
router.put("/dislike/:videoId", verifyToken, dislike);

//save/share
router.put("/save/:videoId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const videoId = req.params.videoId;

    if (!user.savedVideos.includes(videoId)) {
      user.savedVideos.push(videoId);
      await user.save();
    }

    // Populate saved videos and return them
    await user.populate("savedVideos");
    res.status(200).json(user.savedVideos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving video" });
  }
});
router.put("/share/:videoId", verifyToken, shareVideo);
// routes/users.js
// Get saved videos
router.get("/saved", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("savedVideos");
    res.status(200).json(user.savedVideos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching saved videos" });
  }
});

export default router;
