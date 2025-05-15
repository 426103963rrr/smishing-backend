import { saveDetection } from "./detection.controller.js";

// Mock detection logic — replace this later with your AI or rule-based system
const detectSmishing = (content) => {
  return content.toLowerCase().includes("click here") ? "smishing" : "safe";
};

export const scan = async (req, res) => {
  const { sender, content } = req.body;

  if (!sender || !content) {
    return res.status(400).json({ error: "sender and content are required" });
  }

  try {
    const result = detectSmishing(content);

    await saveDetection({ sender, content, result });

    res.status(200).json({
      message: "Scan completed",
      sender,
      content,
      result,
    });
  } catch (err) {
    console.error("Error scanning SMS:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const scanBatch = async (req, res) => {
  const smsBatch = req.body.messages;

  if (!Array.isArray(smsBatch) || smsBatch.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const results = [];

    for (const sms of smsBatch) {
      if (!sms.sender || !sms.content) {
        results.push({ error: "Invalid SMS data", sms });
        continue;
      }

      const result = detectSmishing(sms.content);

      await saveDetection({
        sender: sms.sender,
        content: sms.content,
        result,
      });

      results.push({
        sender: sms.sender,
        content: sms.content,
        result,
      });
    }

    res.status(200).json({
      message: "Batch scan completed",
      results,
    });
  } catch (err) {
    console.error("Error scanning batch:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
