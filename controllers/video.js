import User from "../models/User.js";
import Video from "../models/Video.js";

/* ================= ADD VIDEO ================= */
export const addVideo = async (req, res, next) => {
  try {
    const protocol = req.protocol;
    const host = req.get("host");

    const videoUrl = req.files?.video?.[0]
      ? `${protocol}://${host}/uploads/videos/${req.files.video[0].filename}`
      : "";

    const imgUrl = req.files?.img?.[0]
      ? `${protocol}://${host}/uploads/images/${req.files.img[0].filename}`
      : "";

    const newVideo = new Video({
      userId: req.user.id,
      title: req.body.title,
      desc: req.body.desc,
      tags: req.body.tags?.split(",") || [],
      type: req.body.type,
      videoUrl,
      imgUrl,
    });

    const savedVideo = await newVideo.save();
    res.status(200).json(savedVideo);
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE VIDEO ================= */
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (req.user.id !== video.userId)
      return res.status(403).json({ message: "Not authorized" });

    const protocol = req.protocol;
    const host = req.get("host");

    const videoUrl = req.files?.video?.[0]
      ? `${protocol}://${host}/uploads/videos/${req.files.video[0].filename}`
      : video.videoUrl;

    const imgUrl = req.files?.img?.[0]
      ? `${protocol}://${host}/uploads/images/${req.files.img[0].filename}`
      : video.imgUrl;

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title || video.title,
        desc: req.body.desc || video.desc,
        tags: req.body.tags ? req.body.tags.split(",") : video.tags,
        type: req.body.type || video.type,
        videoUrl,
        imgUrl,
      },
      { new: true }
    );

    res.status(200).json(updatedVideo);
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE VIDEO ================= */
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (req.user.id !== video.userId)
      return res.status(403).json({ message: "Not authorized" });

    await Video.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/* ================= GET SINGLE VIDEO ================= */
export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    res.status(200).json(video);
  } catch (err) {
    next(err);
  }
};

/* ================= ADD VIEW ================= */
export const addView = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });
    res.status(200).json("View increased");
  } catch (err) {
    next(err);
  }
};

/* ================= USER VIDEOS (🔥 IMPORTANT) ================= */
export const getUserVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

/* ================= OTHERS ================= */
export const random = async (req, res, next) => {
  try {
    const videos = await Video.aggregate([{ $sample: { size: 40 } }]);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const trend = async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ views: -1 }).limit(40);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const sub = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const list = await Promise.all(
      user.subscribedUsers.map((id) => Video.find({ userId: id }))
    );
    res.status(200).json(list.flat());
  } catch (err) {
    next(err);
  }
};

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Video.distinct("tags");
    res.status(200).json(["All", ...tags]);
  } catch (err) {
    next(err);
  }
};

export const getByTag = async (req, res, next) => {
  try {
    const videos = await Video.find({
      tags: { $in: req.query.tags.split(",") },
    });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const search = async (req, res, next) => {
  try {
    const videos = await Video.find({
      title: { $regex: req.query.q, $options: "i" },
    });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const getByType = async (req, res, next) => {
  try {
    const videos = await Video.find({ type: req.params.type });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};
