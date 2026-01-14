import { createError } from "../error.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profile-pic";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

export const updateUser = [
  upload.single("img"),
  async (req, res, next) => {
    if (req.params.id !== req.user.id) {
      return next(createError(403, "Not authorized"));
    }

    try {
      const updates = {
        name: req.body.name,
        username: req.body.username,
      };

      if (req.file) {
        const protocol = req.protocol;
        const host = req.get("host");
        updates.img = `${protocol}://${host}/uploads/profile-pic/${req.file.filename}`;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true }
      );

      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  }
];
export const deleteUser = async(req, res, next) => {
    if (req.params.id === req.user.id) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("User has been deleted");
        } catch (error) {
            next(error);
        }
    } else {
        return next(createError(403, 'You are not authorized to delete this user'));
    }
}
export const getUser = async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}
export const subscribe = async(req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $push: { subscribedUsers: req.params.id },
        }, { useFindAndModify: false });
        await User.findByIdAndUpdate(req.params.id, {
            $inc: { subscribers: 1 },
        }, { useFindAndModify: false });
        res.status(200).json("Subscription Successful");
    } catch (err) {
        next(err);
    }
}

export const unsubscribe = async(req, res, next) => {
    try {
        try {
            await User.findByIdAndUpdate(req.user.id, {
                $pull: { subscribedUsers: req.params.id },
            }, { useFindAndModify: false });
            await User.findByIdAndUpdate(req.params.id, {
                $inc: { subscribers: -1 },
            }, { useFindAndModify: false });
            res.status(200).json("Unsubscription successfull.")
        } catch (err) {
            next(err);
        }
    } catch (err) {
        next(err);
    }
};

export const like = async(req, res, next) => {
    const id = req.user.id;
    const videoId = req.params.videoId;
    try {
        await Video.findByIdAndUpdate(videoId, {
            $addToSet: { likes: id },
            $pull: { dislikes: id }
        }, { useFindAndModify: false })
        res.status(200).json("Video liked");
    } catch (err) {
        next(err);
    }
}
export const dislike = async(req, res, next) => {
    const id = req.user.id;
    const videoId = req.params.videoId;
    try {
        await Video.findByIdAndUpdate(videoId, {
            $addToSet: { dislikes: id },
            $pull: { likes: id }
        }, { useFindAndModify: false })
        res.status(200).json("Video disliked");
    } catch (err) {
        next(err);
    }
}
// Save a video
// userController.js
export const saveVideo = async (req, res, next) => {
    console.log("USER:", req.user);
    console.log("VIDEO ID:", req.params.videoId);
  try {
    const userId = req.user.id;
    const videoId = req.params.videoId;
    
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json("Video not found");
    }

    const alreadySaved = video.savedBy.includes(userId);

    if (alreadySaved) {
      // UNSAVE
      await User.findByIdAndUpdate(userId, {
        $pull: { savedVideos: videoId },
      });

      await Video.findByIdAndUpdate(videoId, {
        $pull: { savedBy: userId },
      });
    } else {
      // SAVE
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedVideos: videoId },
      });

      await Video.findByIdAndUpdate(videoId, {
        $addToSet: { savedBy: userId },
      });
    }

    const updatedVideo = await Video.findById(videoId);
    res.status(200).json(updatedVideo);
  } catch (err) {
    next(err);
  }
};


// Share a video (can store user IDs who shared it)
// Share a video (1 user = 1 share)
export const shareVideo = async (req, res, next) => {
  const userId = req.user.id;
  const videoId = req.params.videoId;

  try {
    const video = await Video.findById(videoId);

    if (!video.share.includes(userId)) {
      // Add user to share array
      video.share.push(userId);
      await video.save();
    }

    res.status(200).json(video.share.length); // return updated share count
  } catch (err) {
    next(err);
  }
};
// Get all saved videos of a user
export const getSavedVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({
      savedBy: req.user.id,
    });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const getFollowingList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("subscribedUsers");

    const followingUsers = await User.find(
      { _id: { $in: user.subscribedUsers } },
      "name img subscribers"
    );

    res.status(200).json(followingUsers);
  } catch (err) {
    next(err);
  }
};

export const getFollowersList = async (req, res, next) => {
  try {
    const followers = await User.find(
      { subscribedUsers: req.user.id },
      "name img subscribers"
    );

    res.status(200).json(followers);
  } catch (err) {
    next(err);
  }
};

