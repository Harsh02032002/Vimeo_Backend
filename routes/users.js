import express from "express";
import { 
  updateUser, deleteUser, getUser, 
  subscribe, unsubscribe, like, dislike,
  saveVideo, shareVideo, getFollowingList, getFollowersList
} from "../controllers/user.js";
import { verifyToken } from "../verifyToken.js";
import { getSavedVideos } from "../controllers/user.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
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
    const userId = req.user.id;
    const videoId = req.params.videoId;

    const user = await User.findById(userId);
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json("Video not found");
    }

    const alreadySaved = user.savedVideos.includes(videoId);

    if (alreadySaved) {
      // UNSAVE
      user.savedVideos.pull(videoId);
      video.savedBy.pull(userId);
    } else {
      // SAVE
      user.savedVideos.push(videoId);
      video.savedBy.push(userId);
    }

    await user.save();
    await video.save();

    res.status(200).json({
      savedByCount: video.savedBy.length,
      saved: !alreadySaved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Save failed");
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
router.get("/following", verifyToken, getFollowingList);
router.get("/followers", verifyToken, getFollowersList);

export default router;
