import Ball from "./Ball.js";
import Paddle from "./Paddle.js";

const ball = new Ball(document.getElementById("ball"));
const playerPaddle = new Paddle(document.getElementById("player-paddle"));
const computerPaddle = new Paddle(document.getElementById("computer-paddle"));
const playerScoreElem = document.getElementById("player-score");
const computerScoreElem = document.getElementById("computer-score");
var start = false;

const socket = io("http://localhost:3000");

socket.on("init", handleInit);

let lastTime;

function update(time) {
  //window.requestAnimationFrame(update);
  if (lastTime != null) {
    const delta = time - lastTime;
    if (start == true) {
      ball.update(delta, [playerPaddle.rect(), computerPaddle.rect()]);
      playerScoreElem.textContent = 0;
      computerScoreElem.textContent = 0;
    }
    computerPaddle.update(delta, ball.y);

    const hue = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--hue")
    );
    document.documentElement.style.setProperty("--hue", hue + delta * 0.01);

    if (isLose()) handleLose();
  }
  lastTime = time;
}

function isLose() {
  const rect = ball.rect();
  return rect.right >= window.innerWidth || rect.left <= 0;
}

function handleLose() {
  const rect = ball.rect();
  if (rect.right >= window.innerWidth) {
    playerScoreElem.textContent = parseInt(playerScoreElem.textContent) + 1;
  } else {
    computerScoreElem.textContent = parseInt(computerScoreElem.textContent) + 1;
  }

  ball.reset();
  computerPaddle.reset();
  if (playerScoreElem.textContent == 1 || computerScoreElem.textContent == 1) {
    start = false;
    btn.style.display = "block";
  }
}

btn.addEventListener("click", () => {
  socket.emit('startGame')
  btn.style.display = "none";
  btnmulti.style.display = "none";
  start = true;
});

document.addEventListener("mousemove", (e) => {
  playerPaddle.position = (e.y / window.innerHeight) * 100;
});

update();

function handleInit(msg) {
  console.log(msg);
}

