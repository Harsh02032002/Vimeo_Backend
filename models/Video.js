import mongoose from "mongoose";
const VideoSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    imgUrl: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["music", "sports", "gaming", "movies", "news","shorts"],
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    tags: {
        type: [String],
        default: [],
    },
    likes: {
        type: [String],
        default: [],
    },
    dislikes: {
        type: [String],
        default: [],
    },
    share: {
        type: [String],
        default: [],
    },
    save: {
        type: [String],
        default: [],
    },
}, { timestamps: true });
export default mongoose.model("Video", VideoSchema);