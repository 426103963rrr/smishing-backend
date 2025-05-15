import express from "express";
import { scan, scanBatch } from "../controllers/scan.controller.js";

const router = express.Router();

// POST /api/scan
router.post("/scan", scan);

// POST /api/scan-batch
router.post("/scan-batch", scanBatch);

export default router;
