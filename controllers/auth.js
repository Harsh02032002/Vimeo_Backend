import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../error.js";
import { randomBytes } from "crypto"; // ✅ FIXED IMPORT

// ================= SIGN UP =================
export const signup = async (req, res, next) => {
  try {
    // email check
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // username check
    const usernameExists = await User.findOne({ username: req.body.username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      img: req.body.img,
      password: hash,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Signup successful",
    });
  } catch (err) {
    next(err);
  }
};

// ================= SIGN IN =================
export const signin = async (req, res, next) => {
  try {
    const user = req.body.email
      ? await User.findOne({ email: req.body.email })
      : await User.findOne({ username: req.body.username });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const isCorrect = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isCorrect) {
      return next(createError(400, "Wrong credentials"));
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password, ...others } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true, // 🔥 MUST for Vercel
        sameSite: "none", // 🔥 cross-domain
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(others);
  } catch (err) {
    next(err);
  }
};

// ================= GOOGLE AUTH =================
export const googleAuth = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      const generatedPassword = randomBytes(16).toString("hex"); // ✅ FIXED
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(generatedPassword, salt);

      user = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        img: req.body.img,
        password: hash,
      });

      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT,
      { expiresIn: "7d" }
    );

    const { password, ...others } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(others);
  } catch (err) {
    next(err);
  }
};

// ================= SIGN OUT =================
export const signout = async (req, res) => {
  res
    .clearCookie("access_token")
    .status(200)
    .json("Logged out successfully");
};
export const verifytoken = async(req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(400).send({ message: "User Not Found" });

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send({ message: "Invalid link" });

        // await User.updateOne({ _id: user._id, verified: true });
        await User.findByIdAndUpdate(user._id, {
            verified: true
        }, { new: true, useFindAndModify: false })
        await token.remove();
        res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error verifytoken error" });
    }
};