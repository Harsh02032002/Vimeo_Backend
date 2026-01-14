import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import videoRoutes from "./routes/videos.js";
import commentRoutes from "./routes/comments.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();

/* ===================== CORS ===================== */

const allowedOrigins = [
  "http://localhost:3000",
  "https://vi-tube-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ===================== MONGODB (IMPORTANT FIX) ===================== */

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

/* ===================== MIDDLEWARES ===================== */

app.use(cookieParser());
app.use(express.json());

/* ===================== ROUTES ===================== */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);

/* ===================== STATIC FILES ===================== */

app.use(
  "/uploads/videos",
  express.static(path.join(__dirname, "uploads/videos"))
);
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads/images"))
);
app.use(
  "/uploads/profile-pic",
  express.static(path.join(__dirname, "uploads/profile-pic"))
);

/* ===================== ERROR HANDLER ===================== */

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({
    success: false,
    message,
    status,
  });
});

/* ===================== SERVER ===================== */

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  await connectDB(); // 🔥 VERY IMPORTANT
  console.log(`Server running on port ${PORT}`);
});
