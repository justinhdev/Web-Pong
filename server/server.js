const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://127.0.0.1:5501"],
  },
});

var index = new Array();
var spot;
io.on("connection", (socket) => {
  index.push(socket.id);
  io.emit("getIndex", index);

  socket.on("startGame-send", () => {
    io.emit("startGame-recieve");
  });
  socket.on("mousePosition-send1", (mousePos) => {
    io.emit("mousePosition-recieve1", mousePos);
  });
  socket.on("mousePosition-send2", (mousePos) => {
    io.emit("mousePosition-recieve2", mousePos);
  });
  socket.on("ballreset-send", (heading) => {
    io.emit("ballreset-recieve", heading);
  });
  socket.on("ballUpdate-send", (rect1) => {
    io.emit("ballUpdate-recieve", rect1);
  });
  socket.on("delta-send", (deltaSend) => {
    io.emit("delta-recieve", deltaSend);
  });
  socket.on("gameOver-send", () => {
    io.emit("gameOver-recieve");
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
    spot = index.indexOf(socket.id);
    index.splice(spot, 1);
    io.emit("getIndex", index);
  });
});