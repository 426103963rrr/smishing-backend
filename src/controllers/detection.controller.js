import Detection from "../models/detection.model.js";

export const saveDetection = async ({ sender, content, result }) => {
  try {
    const detection = new Detection({ sender, content, result });
    await detection.save();
  } catch (err) {
    console.error("Error saving detection result:", err);
    throw err;
  }
};

export const getDetections = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const detections = await Detection.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Detection.countDocuments();

    res.status(200).json({
      data: detections,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("Error fetching detections:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
