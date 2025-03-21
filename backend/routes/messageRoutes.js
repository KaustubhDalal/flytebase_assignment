const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// Fetch all messages
router.get("/", async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// Save a new message
router.post("/", async (req, res) => {
    try {
        const { text, sender } = req.body;
        if (!text || !sender) return res.status(400).json({ error: "Text and sender are required" });

        const message = new Message({ text, sender });
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: "Failed to save message" });
    }
});

module.exports = router;
