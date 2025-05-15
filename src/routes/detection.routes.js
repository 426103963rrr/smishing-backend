import express from "express";
import { getDetections } from "../controllers/detection.controller.js";

const router = express.Router();

// GET /api/detections
router.get("/detections", getDetections);

export default router;
