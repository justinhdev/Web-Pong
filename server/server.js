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
/*origin: "https://web-2pong.netlify.app"*/

app.get('/', (req, res) => {
  res.send("server is up");
});

server.listen(PORT, () => {
  
});

var index = new Array();
var spot;
var rdycount = 0;
var rdycount2 = 0;

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
  socket.on("roundOver-send", (pscore, cscore) => {
    io.emit("roundOver-recieve", pscore, cscore);
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
  socket.on("hitAudio", () => {
    io.emit("hitAudio-send");
  })
  socket.on("missAudio", () => {
    io.emit("missAudio-send");
  })
  socket.on("ready-send", () => {
    if (socket.id == index[0]){
      rdycount = 1;
    }
    else {
      rdycount2 = 1;
    }
    if (rdycount == 1 && rdycount2 == 1) {
      io.emit("ready-recieve");
      rdycount = 0;
      rdycount2 = 0;
    }
    else {
      io.emit("ready-waiting");
    }
  })
  socket.on("disconnect", () => {
    rdycount = 0;
    rdycount2 = 0;
    spot = index.indexOf(socket.id);
    index.splice(spot, 1);
    io.emit("getIndex", index);
  });
});

function randomNumberBetween(min, max) {
  return Math.random() * (max - min) + min;
}