const Message = require("./models/Message");

const setupSocket = (io) => {
  io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("sendMessage", async (msg, callback) => {
          console.log("Received message:", msg);

          const delays = [7000, 3000, 9000, 1000, 5000];
          const randomDelay = delays[Math.floor(Math.random() * delays.length)];

          // setTimeout(async () => {  // added it for testing the sorting message delivery
              try {
                  const message = new Message({
                      text: msg.text,
                      sender: msg.sender,
                      timestamp: msg.timestamp,
                      fileUrl: msg.fileUrl || "",
                      fileType: msg.fileType || "",
                      fileName: msg.fileName || "",
                  });
                  await message.save();

                  io.emit("receiveMessage", { ...msg, status: "delivered" });

                  callback({ success: true });
              } catch (error) {
                  console.error("Message save failed:", error);
                  callback({ success: false });
              }
          // }, randomDelay); 
      });

      socket.on("disconnect", () => {
          console.log("Client disconnected:", socket.id);
      });
  });
};

module.exports = setupSocket;
