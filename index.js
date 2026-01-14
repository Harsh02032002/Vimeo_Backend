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

/* ===============================
   🔥 MONGO CONNECTION (CACHED)
   =============================== */

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");
  return cached.conn;
}

/* ===============================
   🔥 MIDDLEWARES
   =============================== */

const allowedOrigins = [
  "http://localhost:3000",
  "https://vi-tube-frontend.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ===============================
   🔥 CONNECT DB BEFORE ROUTES
   =============================== */

await connectDB();

/* ===============================
   🔥 ROUTES
   =============================== */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);

/* ===============================
   🔥 STATIC FILES
   =============================== */

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

/* ===============================
   🔥 ERROR HANDLER
   =============================== */

app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    status: err.status || 500,
  });
});

/* ===============================
   🔥 EXPORT FOR VERCEL
   =============================== */

export default app;
