const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Upload file route
router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileName: req.file.originalname
    });
});

module.exports = router;
