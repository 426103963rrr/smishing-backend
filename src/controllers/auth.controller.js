import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import { hashPassword, comparePassword, hashOtp, compareOtp, generateToken } from "../utils/token.util.js";
import { sendEmail } from "../services/email.service.js";

/**
 * POST /api/auth/signup
 */
export const signup = asyncHandler(async (req, res) => {
    const { fullName, phoneNumber, email, password } = req.body;

    if (!fullName || !phoneNumber || !email || !password) {
        const error = new Error("All fields (fullName, phoneNumber, email, password) are required.");
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const error = new Error("Unable to register. Please try again.");
        error.statusCode = 409;
        throw error;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        const error = new Error("Invalid email format.");
        error.statusCode = 422;
        throw error;
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
        fullName,
        phoneNumber,
        email,
        passwordHash,
        isEmailVerified: false,
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60000);

    await Otp.create({
        userId: user._id,
        otpHash,
        expiresAt,
    });

    await sendEmail(email, `Your verification OTP is: ${otpCode}. It will expire in 10 minutes.`);

    res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
    });
});

/**
 * POST /api/auth/verify-otp
 */
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        const error = new Error("Email and OTP required.");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    const otpRecord = await Otp.findOne({
        userId: user._id,
        isUsed: false,
    });

    if (!otpRecord) {
        const error = new Error("Invalid or already used OTP.");
        error.statusCode = 400;
        throw error;
    }

    const isMatch = await compareOtp(otp, otpRecord.otpHash);
    if (!isMatch) {
        const error = new Error("Invalid OTP.");
        error.statusCode = 400;
        throw error;
    }

    if (otpRecord.expiresAt < new Date()) {
        const error = new Error("OTP expired.");
        error.statusCode = 400;
        throw error;
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    user.isEmailVerified = true;
    await user.save();

    res.json({
        success: true,
        message: "Email verified successfully.",
    });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const error = new Error("Email and password are required.");
        error.statusCode = 400;
        throw error;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        const error = new Error("Invalid email format.");
        error.statusCode = 422;
        throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("Invalid email.");
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
        const error = new Error("Invalid credentials.");
        error.statusCode = 401;
        throw error;
    }

    if (!user.isEmailVerified) {
        const error = new Error("Please verify your email before logging in.");
        error.statusCode = 403;
        throw error;
    }

    const token = generateToken({ userId: user._id });

    res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
    });
});
