const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    text: { type: String },
    sender: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ["pending", "sent", "delivered", "failed"], 
        default: "pending" 
    },
    fileUrl: { type: String },  
    fileType: { type: String },
    fileName: { type: String }
});

module.exports = mongoose.model("Message", messageSchema);
