const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

const game = document.body.querySelector("#game");
const gameOverUi = document.querySelector("#game-over");
const button = document.querySelector("#game-over button");
const ROWS = 3;
const COLS = 3;
const TICK_FREQ = 200;

let snakeBody = [];
let gameState;
let tickId;

// Inital game state

init();

// ------- Helpers

function init() {
  button.addEventListener("click", restartGame);

  createBoard(ROWS, COLS);
  createSnake();
  createFood();

  addMovement();

  ticks();
}

function restartGame() {
  console.info("Restarting game");
  gameState = undefined;
  gameOverUi.classList.add("not-active");
  game.innerHTML = "";
  snakeBody = [];
  init();
}

function gameOver(win) {
  console.info("Game over");
  gameState = "gameover";
  if (tickId) {
    clearInterval(tickId);
    tickId = undefined;
  }
  gameOverUi.classList.remove("not-active");
  if (win) {
    gameOverUi.querySelector("button").textContent = "You won!";
  } else {
    gameOverUi.querySelector("button").textContent = "Try again";
  }
}

function ticks() {
  tickId = setInterval(() => {
    console.info("Tick");
    const [x, y] = snakeBody[0];
    switch (gameState) {
      case DIRECTIONS.UP:
        {
          checkMove(x, Number(y - 1));
        }
        break;
      case DIRECTIONS.DOWN:
        {
          checkMove(x, Number(y + 1));
        }
        break;
      case DIRECTIONS.LEFT:
        {
          checkMove(Number(x - 1), y);
        }
        break;
      case DIRECTIONS.RIGHT:
        {
          checkMove(Number(x + 1), y);
        }
        break;
      default:
        return;
    }

    game.querySelectorAll(".cell").forEach((element) => {
      element.classList.remove("snake");
      element.classList.remove("head");
    });

    snakeBody.forEach((coord, i) => {
      const [x, y] = coord;
      const el = document.querySelector(`[data-cell="${x}-${y}"]`);
      if (el) {
        el.classList.add("snake");
        if (i === 0) {
          el.classList.add("head");
        }
      }
    });
    if (snakeBody.length === ROWS * COLS) {
      gameOver(true);
    }
    const food = game.querySelector(".food");
    if (!food) {
      createFood();
    }
  }, TICK_FREQ);
}

function checkMove(x, y) {
  // End if out of board
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) {
    console.info("Out of board");
    gameOver();
    return;
  }

  // End if touch self
  if (containsArray(snakeBody, [x, y])) {
    console.info("Touched self");
    gameOver();
    return;
  }

  // Touch food
  const nextCell = game.querySelector(`[data-cell="${x}-${y}"]`);
  if (nextCell?.classList.contains("food")) {
    nextCell.classList.remove("food");
    const [x, y] = nextCell.dataset.cell.split("-");
    snakeBody.unshift([Number(x), Number(y)]);
  } else {
    // Define new position
    if (snakeBody.length > 1) {
      snakeBody = [[x, y], ...snakeBody.slice(0, -1)];
    }
    snakeBody[0] = [x, y];
  }
}

function move(direction) {
  if (
    (gameState === DIRECTIONS.UP || gameState === DIRECTIONS.DOWN) &&
    (direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN)
  )
    return;
  if (
    (gameState === DIRECTIONS.LEFT || gameState === DIRECTIONS.RIGHT) &&
    (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT)
  )
    return;
  gameState = direction;
}

function addMovement() {
  document.addEventListener("keydown", function (event) {
    if (gameState !== "gameover") {
      switch (event.key) {
        case "ArrowUp":
          move(DIRECTIONS.UP);
          break;
        case "ArrowDown":
          move(DIRECTIONS.DOWN);
          break;
        case "ArrowLeft":
          move(DIRECTIONS.LEFT);
          break;
        case "ArrowRight":
          move(DIRECTIONS.RIGHT);
          break;
      }
    }
  });
}

function createSnake() {
  console.info("Creating player");
  const cells = game.querySelectorAll(".cell");
  const snakeCell = getRandomItem(cells);
  const [x, y] = snakeCell.dataset.cell.split("-");
  console.info(x, y);
  snakeCell.classList.add("snake");
  snakeCell.classList.add("head");
  snakeBody[0] = [Number(x), Number(y)];
}

function createFood() {
  console.info("Creating food");
  const cellsCoords = [...game.querySelectorAll(".cell")].map((el) =>
    el.dataset.cell.split("-").map((n) => Number(n))
  );
  console.log(cellsCoords);
  const freeCellsCoords = cellsCoords.filter(
    (coords) => !containsArray(snakeBody, coords)
  );
  console.log(freeCellsCoords);
  const [x, y] = getRandomItem(freeCellsCoords);
  const foodCell = game.querySelector(`[data-cell="${x}-${y}"]`);
  foodCell.classList.add("food");
  console.info(x, y);
}

function createBoard(x, y) {
  console.info(`Creating board: ${x},${y}`);
  for (let i = 0; i < y; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < x; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.cell = `${i}-${j}`;
      row.appendChild(cell);
    }
    game.appendChild(row);
  }
}

function getRandomItem(arr) {
  // Ensure the array is not empty
  if (arr.length === 0) {
    return null;
  }
  // Generate a random index based on the array length
  const randomIndex = Math.floor(Math.random() * arr.length);
  // Return the item at the random index
  return arr[randomIndex];
}

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((element, index) => element === arr2[index]);
}

function containsArray(outerArray, innerArray) {
  return outerArray.some((subArray) => arraysEqual(subArray, innerArray));
}
