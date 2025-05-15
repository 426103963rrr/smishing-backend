import express from "express";
import asyncHandler from "../utils/asyncHandler.js"
import { signup, verifyOtp, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", asyncHandler(signup));
router.post("/verify-otp", asyncHandler(verifyOtp));
router.post("/login", asyncHandler(login));

router.get('/error-test', (req, res, next) => {
    const err = new Error('This is a forced error!');
    err.statusCode = 400; // you can set custom status codes if you want
    next(err);
  });



export default router;