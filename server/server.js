/*const io = require("socket.io")(process.env.PORT, {
  cors: {
    origin: ["http://127.0.0.1:5501"],
  },
});*/
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5501"
  }
});
const PORT = process.env.PORT || 3000;

//app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send("server is up");
});

/*app.get('/client/script.js', (req, res) => {
  res.sendFile('/home/huginn/code/online-pong/client/script.js');
});*/

server.listen(PORT, () => {
  
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
    socket.emit("gameOver-recieve");
  });
  socket.on("getHeading", () => {
    var test = 0;
    while (
      Math.abs(test) <= 0.2 ||
      Math.abs(test) >= 0.9
    ) {
      var heading = randomNumberBetween(0, 2 * Math.PI)
      test = Math.cos(heading);
    }
    io.emit("getHeading-send", heading);
  });
  socket.on("disconnect", () => {
    spot = index.indexOf(socket.id);
    index.splice(spot, 1);
    io.emit("getIndex", index);
  });
  socket.on("playerpaddle", (rect) => {
    io.emit("playerpaddle-recieve", (rect));
  });
  socket.on("computerpaddle", (rect) => {
    io.emit("computerpaddle-recieve", (rect));
  });
});

function randomNumberBetween(min, max) {
  return Math.random() * (max - min) + min;
}