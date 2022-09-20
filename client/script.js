import Ball from "./Ball.js";
import Paddle from "./Paddle.js";

const socket = io("http://localhost:3000");

var initHeading;
socket.on("getHeading", (heading) => {
  initHeading = heading;
})

const ball = new Ball(document.getElementById("ball"), initHeading);
const playerPaddle = new Paddle(document.getElementById("player-paddle"));
const computerPaddle = new Paddle(document.getElementById("computer-paddle"));
const playerScoreElem = document.getElementById("player-score");
const computerScoreElem = document.getElementById("computer-score");

var start = false;
var newRect;
var delta;
var playernum;

socket.on("getIndex", (index) => {
  playernum = index[0];
  console.log(playernum);
});

socket.on("startGame-recieve", (heading) => {
  startGame();
});
socket.on("mousePosition-recieve1", (mousePos) => {
  playerPaddle.position = mousePos;
});
socket.on("mousePosition-recieve2", (mousePos) => {
  computerPaddle.position = mousePos;
});
socket.on("ballUpdate-recieve", (rect) => {
  newRect = rect;
});
socket.on("delta-recieve", (deltaSend) => {
  delta = deltaSend;
});
socket.on("gameOver-recieve", () => {
  handleLose();
})

btn.addEventListener("click", () => {
  socket.emit("startGame-send");
});

document.addEventListener("mousemove", (e) => {
  var mousePos = (e.y / window.innerHeight) * 100;
  if (playernum == socket.id) {
    socket.emit("mousePosition-send1", mousePos);
  } else {
    socket.emit("mousePosition-send2", mousePos);
  }
});

function startGame() {
  btn.style.display = "none";
  btnmulti.style.display = "none";
  ball.reset(initHeading)
  start = true;
}

let lastTime;
function update(time) {
  requestAnimationFrame(update);

  if (lastTime != null) {
    if (playernum == socket.id) {
      const deltaSend = time - lastTime;
      socket.emit("delta-send", deltaSend);
    }
    var rect1 = playerPaddle.rect();
    var rect2 = computerPaddle.rect();
    if (playernum == socket.id) {
      rect1 = playerPaddle.rect();
    } else {
      rect2 = computerPaddle.rect();
    }
    if (start == true) {
      socket.emit("ballUpdate-send", [rect1, rect2]);
      ball.update(delta, newRect);
      playerScoreElem.textContent = 0;
      computerScoreElem.textContent = 0;
    }
    if (isLose()){ 
      socket.emit("gameOver-send");
      handleLose();
    }
  }
  lastTime = time;
}

function isLose() {
  const rect = ball.rect();
  return rect.right >= window.innerWidth || rect.left <= 0;
}

function handleLose() {
  const rect = ball.rect();
  socket.emit("getHeading-send");
  if (rect.right >= window.innerWidth) {
    playerScoreElem.textContent = parseInt(playerScoreElem.textContent) + 1;
  } else {
    computerScoreElem.textContent = parseInt(computerScoreElem.textContent) + 1;
  }

  ball.reset(initHeading);
  //computerPaddle.reset();
  if (playerScoreElem.textContent == 1 || computerScoreElem.textContent == 1) {
    start = false;
    btn.style.display = "block";
  }
}


update();

