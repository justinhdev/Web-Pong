const socket = io("http://localhost:3000");

const INITIAL_VELOCITY = 0.025;
const VELOCITY_INCREASE = 0.00001;
const SPEED = .01

class Ball {
  constructor(ballElem) {
    this.ballElem = ballElem;
    this.reset();
  }

  get x() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"));
  }

  set x(value) {
    this.ballElem.style.setProperty("--x", value);
  }

  get y() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"));
  }

  set y(value) {
    this.ballElem.style.setProperty("--y", value);
  }

  rect() {
    return this.ballElem.getBoundingClientRect();
  }

  reset() {
    this.x = 50;
    this.y = 50;
    this.direction = { x: 0 };
    while (
      Math.abs(this.direction.x) <= 0.2 ||
      Math.abs(this.direction.x) >= 0.9
    ) {
      const heading = randomNumberBetween(0, 2 * Math.PI);
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) };
    }
    this.velocity = INITIAL_VELOCITY;
  }

  update(delta, paddleRects) {
    this.x += this.direction.x * this.velocity * delta;
    this.y += this.direction.y * this.velocity * delta;
    this.velocity += VELOCITY_INCREASE * delta;
    const rect = this.rect();

    if (rect.bottom >= window.innerHeight || rect.top <= 0) {
      this.direction.y *= -1;
    }
    if (paddleRects.some(r => isCollision(r, rect))) {
      this.direction.x *= -1;
    }
  }
}

class Paddle {
  constructor(paddleElem) {
      this.paddleElem = paddleElem
      this.reset()
  }

  get position() {
      return parseFloat(getComputedStyle(this.paddleElem).getPropertyValue("--position"));
  }

  set position(value) {
      this.paddleElem.style.setProperty("--position", value);
  }

  rect() {
      return this.paddleElem.getBoundingClientRect()
  }

  reset() {
      this.position = 50;
  }

  update(delta, ballHeight) {
      this.position += SPEED * delta * (ballHeight - this.position);
  }
}





const ball = new Ball(document.getElementById("ball"));
const playerPaddle = new Paddle(document.getElementById("player-paddle"));
const computerPaddle = new Paddle(document.getElementById("computer-paddle"));
const playerScoreElem = document.getElementById("player-score");
const computerScoreElem = document.getElementById("computer-score");

var start = false;
var newRect;
var delta;
var playernum;
var index = 0;

socket.on("getIndex", (index) => {
  playernum = index[0];
});

socket.on("startGame-recieve", () => {
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
});

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
  ball.reset();
  start = true;
}

let lastTime;
function update(time) {
  index++;
  console.log(index);
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
    if (isLose()) {
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
  if (rect.right >= window.innerWidth) {
    playerScoreElem.textContent = parseInt(playerScoreElem.textContent) + 1;
  } else {
    computerScoreElem.textContent = parseInt(computerScoreElem.textContent) + 1;
  }

  ball.reset();
  if (playerScoreElem.textContent == 1 || computerScoreElem.textContent == 1) {
    start = false;
    btn.style.display = "block";
  }
}

function randomNumberBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function isCollision(rect1, rect2) {
  return (
    rect1.left <= rect2.right &&
    rect1.right >= rect2.left &&
    rect1.top <= rect2.bottom &&
    rect1.bottom >= rect2.top
  )
}

update();
