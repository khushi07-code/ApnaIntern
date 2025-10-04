const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS for frontend on port 8080
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});


app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("userMessage", (msg) => {
    const reply = generateBotReply(msg);
    socket.emit("botReply", reply);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

function generateBotReply(msg) {
  msg = msg.toLowerCase();
  if (msg.includes("internship")) return "Try filtering by category or location!";
  if (msg.includes("hello")) return "Hi there! How can I help you today?";
  return "I'm still learning. Can you rephrase that?";
}

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
