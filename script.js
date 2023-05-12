const [body, screen, startButton, nextTetra, width, score, level, leftButton, rightButton, downButton, rotateButton, buttons] = [
  document.querySelector("#gameboyBody"),
  document.querySelector("#screen"),
  document.querySelector("#start"),
  document.querySelector("#next-tetra"),
  10,
  document.querySelector("#score"),
  document.querySelector("#level"),
  document.querySelector("#left-button"),
  document.querySelector("#right-button"),
  document.querySelector("#down-button"),
  document.querySelector("#rotate-button"),
  document.querySelectorAll("button")
]

//Loop for adding classes and divs
function addDivs() {
  for (let i = 1; i <= 230; i++) {
    const cells = document.createElement("div")
    cells.classList.add("cell-blocks")
    cells.setAttribute("id", i)
    const rowNum = Math.ceil(i / 10);
    cells.classList.add(`row${rowNum}`)
    if (cells.classList.contains("row23")) {
      cells.classList.add("collide")
    }

    if (cells.id.endsWith("1")) {
      cells.classList.add("leftEdge")
    } else if (cells.id.endsWith("0")) {
      cells.classList.add("rightEdge")
    }
    screen.append(cells)
  }
}
addDivs()

function populateNextTetra() {
  for (let i = 1; i <= 12; i++) {
    const cells = document.createElement("div");
    cells.classList.add("display-screen")
    nextTetra.append(cells)
  }
}
populateNextTetra()


// creating array from every cell block
const [cellsArray, startingPoint, displayArray] =
  [Array.from(document.querySelectorAll(".cell-blocks")),
  Array.from(document.querySelectorAll(".row2")),
  Array.from(document.querySelectorAll(".display-screen"))]

class Tetra {
  constructor(color, ...shape) {
    this.color = color;
    this.shape = shape
  }
}

const I = new Tetra(
  'lightblue',
  [0, 1, 2, 3],
  [22, 12, 2, -8],
  [0, 1, 2, 3],
  [21, 11, 1, -9],
  [0, 1, 2, 3])

const O = new Tetra(
  'yellow',
  [-9, -8, 1, 2],
  [-9, -8, 1, 2],
  [-9, -8, 1, 2],
  [-9, -8, 1, 2],
  [-9, -8, 1, 2])

const J = new Tetra(
  'blue',
  [2, 1, 0, -10],
  [11, 1, -9, -8],
  [0, 1, 2, 12],
  [-9, 1, 11, 10],
  [2, 1, 0, -10])

const L = new Tetra(
  'orange',
  [0, 1, 2, -8],
  [-9, 1, 11, 12],
  [2, 1, 0, 10],
  [11, 1, -9, -10],
  [0, 1, 2, -8])

const T = new Tetra(
  'purple',
  [0, 1, 2, -9],
  [11, 1, 2, -9],
  [11, 1, 2, 0],
  [11, 1, -9, 0],
  [0, 1, 2, -9])

const S = new Tetra(
  'green',
  [0, 1, -9, -8],
  [-9, 1, 2, 12],
  [2, 1, 11, 10],
  [11, 1, 0, -10],
  [0, 1, -9, -8])

const Z = new Tetra(
  'red',
  [-10, -9, 1, 2],
  [-8, 2, 1, 11],
  [12, 11, 1, 0],
  [10, 0, 1, -9],
  [-10, -9, 1, 2])

const I_next = new Tetra(
  'lightblue',
  [4, 5, 6, 7])

const O_next = new Tetra(
  'yellow',
  [1, 2, 5, 6])

const T_next = new Tetra(
  'purple',
  [1, 5, 6, 9])

const J_next = new Tetra(
  'blue',
  [2, 6, 9, 10])

const L_next = new Tetra(
  'orange',
  [1, 5, 9, 10])

const S_next = new Tetra(
  'green',
  [2, 6, 5, 9])

const Z_next = new Tetra(
  'red',
  [1, 5, 6, 10])

let current;
let nextShape;
let next;
let savedColor;
const Tetrominos = [I, O, T, L, J, S, Z]
const displayTetrominos = [I_next, O_next, T_next, J_next, L_next, S_next, Z_next];
let random = Math.floor(Math.random() * Tetrominos.length)

const getNextTetra = () => Tetrominos[random]
const getDisplayTetra = () => displayTetrominos[random]

current = getNextTetra()
next = getDisplayTetra()
nextShape = current.shape[1]
let position = 13;
let rotationCount = 1;
let singleLineCheck = false
let startDisplay = false;
let scoring = 10
let numForScoring = 0;
let leveling = 1;
let updateScore = [10];
let threshold = [100];
let interval = 1000;
let gameIsOver = false
const themeSong = new Audio("/audio/theme.mp3")
const collisionSound = new Audio("/audio/move.mp3")

startButton.addEventListener('click', function() {
  timer = setInterval(moveDown, 1000);
  themeSong.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);
  themeSong.play()
});

function updateTimer() {
  interval = Math.floor(1000 - (leveling - 1) * 100);
  clearInterval(timer); 
  timer = setInterval(moveDown, interval); 
}

function gameOver() {
  const gameover = startingPoint.some(index => index.classList.contains("collide"))

  if (gameover) {
    clearTimeout(timer)
    buttons.forEach(function(button) {
      button.classList.remove("pressed")
    })
    gameIsOver = true
    themeSong.pause()
    screen.innerHTML = ""
    const gameOverScreen = document.createElement("div");
    gameOverScreen.classList.add("game-over")
    gameOverScreen.innerHTML = `Game Over<br>Your score is ${scoring}`;
    body.append(gameOverScreen)
  }
}

function updateScoring() {
  for (let i = 0; i < threshold.length; i++) {
    if (scoring < threshold[0]) {
      numForScoring = updateScore[0]
    } else if (scoring >= threshold[0]) {
      threshold.push(threshold[i] * 3)
      updateScore.push(updateScore[0] + 5)
      threshold.shift()
      updateScore.shift()
      leveling++
      updateTimer()
    }
  }
  score.textContent = scoring
  level.textContent = leveling
}

function draw() {
  current.shape[0].forEach(index => {
    cellsArray[position + index].classList.add(current.color)
  })
}

function undraw() {
  current.shape[0].forEach(index => {
    cellsArray[position + index].classList.remove(current.color)
  })
}

function drawNextShape() {
  next.shape[0].forEach(cell => {
    const displayCell = displayArray[cell];
    displayCell.classList.add(next.color);
  });
}

function undrawNextShape() {
  next.shape[0].forEach(cell => {
    const displayCell = displayArray[cell];
    displayCell.classList.remove(next.color);
  });
}

drawNextShape()
draw()

function moveDown() {
  if (!gameIsOver) {
  drawNextShape()
  undraw();
  position += width
  draw()
  collision()
  gameOver()
}
}

function clearRow() {
  const colorsToRemove = ['orange', 'purple', 'blue', 'lightblue', 'red', 'green', 'yellow']

  for (let i = 3; i <= 22; i++) {
    const rows = document.getElementsByClassName(`row${i}`);
    let isFull = true;

    for (let j = 0; j < rows.length; j++) {
      if (!rows[j].classList.contains("collide")) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      for (let j = 0; j < rows.length; j++) {
        rows[j].classList.add("anima")
        rows[j].classList.remove("collide")
        rows[j].classList.remove.apply(rows[j].classList, colorsToRemove)
        setTimeout(() => {
          rows[j].classList.remove("anima")
        }, 500)
        scoring += numForScoring
        updateScoring()
        const clearAudio = new Audio("/audio/clear.mp3")
        clearAudio.play()
      }
      moveRestOfTetrimonos(i)
    }
  }
}

function moveRestOfTetrimonos(val) {
  const colorsToToggle = ['orange', 'purple', 'blue', 'lightblue', 'red', 'green', 'yellow']
  for (let i = val; i >= 3; i--) {
    const currentRow = document.getElementsByClassName(`row${i}`);
    const nextRow = Array.from(document.getElementsByClassName(`row${i - 1}`));

    for (let j = 0; j < currentRow.length; j++) {
      const currentCell = currentRow[j];
      const nextCell = nextRow[j];
      if (nextCell.classList.contains("collide")) {
        currentCell.classList.add("collide")
        nextCell.classList.remove("collide")

        colorsToToggle.forEach(color => {
          if (nextCell.classList.contains(color)) {
            currentCell.classList.add(color)
            nextCell.classList.remove(color)
          }
        })
      }
    }
  }
}


function collision() {
  let shape = current.shape[0].some(index => cellsArray[index + width + position].classList.contains("collide"))

  if (shape) {
    current.shape[0].forEach(index => cellsArray[position + index].classList.add("collide"))
    collisionSound.play()
    clearRow()
    savedColor = next.color

    switch (savedColor) {
      case 'lightblue':
        current.shape = I.shape
        current.color = I.color
        break;
      case 'yellow':
        current.shape = O.shape
        current.color = O.color
        break;
      case 'purple':
        current.shape = T.shape
        current.color = T.color
        break;
      case 'blue':
        current.shape = J.shape;
        current.color = J.color
        break;
      case 'orange':
        current.shape = L.shape;
        current.color = L.color
        break;
      case 'green':
        current.shape = S.shape;
        current.color = S.color
        break;
      case 'red':
        current.shape = Z.shape;
        current.color = Z.color
        break;
    }
    undrawNextShape()

    random = Math.floor(Math.random() * Tetrominos.length)
    next = displayTetrominos[random]
    current.shape[0] = current.shape[4]
    rotationCount = 1
    singleLineCheck = false
    position = 13
    draw()
    scoring += numForScoring
    updateScoring()
  }
}

function moveLeft() {
  const isAtLeftEdge = current.shape[0].some(
    (index) => (position + index) % width === 0
  );
  const leftTetromino = current.shape[0].some(index => cellsArray[index + position - 1].classList.contains("collide"));

  undraw()
  position -= (isAtLeftEdge || leftTetromino) ? 0 : 1
  draw()
}

function moveRight() {
  const isAtRightEdge = current.shape[0].some(
    (index) => (position + index) % width === width - 1
  );
  const rightTetromino = current.shape[0].some(index => cellsArray[index + position + 1].classList.contains("collide"));

  undraw()
  position += (isAtRightEdge || rightTetromino) ? 0 : 1
  draw()
}

function controlTetrominos() {
  addEventListener("keydown", event => {
    switch (event.key) {
      case 'ArrowLeft':
        leftButton.classList.add("pressed");
        moveLeft();
        setTimeout(function () {
        leftButton.classList.remove("pressed");
        }, 100);
        break;
      case 'ArrowRight':
        rightButton.classList.add("pressed");
        moveRight();
        setTimeout(function () {
        rightButton.classList.remove("pressed");
        }, 100);
        break;
      case 'ArrowDown':
        downButton.classList.add("pressed");
        moveDown();
        setTimeout(function () {
        downButton.classList.remove("pressed")
        }, 100)
        break;
      case 'ArrowUp':
        rotateButton.classList.add("pressed");
        rotation();
        setTimeout(function () {
        rotateButton.classList.remove("pressed");
        }, 100)
        break;
    }
  })

  leftButton.addEventListener("click", function () {
    leftButton.classList.add("pressed");
    moveLeft();
    setTimeout(function () {
      leftButton.classList.remove("pressed");
    }, 100);
  });

  rightButton.addEventListener("click", function () {
    rightButton.classList.add("pressed");
    moveRight();
    setTimeout(function () {
      rightButton.classList.remove("pressed");
    }, 100);
  });

  rotateButton.addEventListener("click", function () {
    rotateButton.classList.add("pressed");
    rotation();
    setTimeout(function () {
      rotateButton.classList.remove("pressed");
    }, 100)
  })
  
  downButton.addEventListener("click", function () {
    downButton.classList.add("pressed");
    moveDown();
    setTimeout(function () {
      downButton.classList.remove("pressed")
    }, 100)
  })
}
controlTetrominos()

function rotationSwitch() {
  for (const tetromino of Tetrominos) {
    if (tetromino.shape.toString() === current.shape.toString()) {
      return tetromino;
    }
  }
}

function rotation() {
  const middleIndex = current.shape[0][0] + position + width
  const stopL = cellsArray[middleIndex + 1].classList.contains("collide")
  const stopR = cellsArray[middleIndex - 1].classList.contains("collide")
  const skip = nextShape.some(index => cellsArray[index + position + width].classList.contains("collide"))
  const skipL = nextShape.some(index => cellsArray[index + position + width].classList.contains("leftEdge"))
  const skipR = nextShape.some(index => cellsArray[index + position + width].classList.contains("rightEdge"))

  if (current.shape == I.shape &&
    (skip || skipL || skipR)) {
    return;
  }

  if (stopL && stopR) {
    singleLineCheck = true
  }
  if (stopL && stopR) {
    return;
  }

  const oldShape = rotationSwitch();
  let newShape = current.shape[0];
  undraw()
  rotationPrecision()
  switch (rotationCount) {
    case 1:
      newShape = oldShape.shape[1]
      nextShape = oldShape.shape[2]
      rotationCount++
      break;
    case 2:
      newShape = oldShape.shape[2]
      nextShape = oldShape.shape[3]
      rotationCount++;
      break;
    case 3:
      newShape = oldShape.shape[3]
      nextShape = oldShape.shape[4]
      rotationCount++
      break;
    case 4:
      newShape = oldShape.shape[4]
      nextShape = oldShape.shape[0]
      rotationCount -= 3
      break;
  }
  current.shape[0] = newShape;
  draw();
}

function rotationPrecision() {
  const isAtLeftEdge = current.shape[0].some(
    (index) => (position + index) % width === 0
  );
  const isAtRightEdge = current.shape[0].some(
    (index) => (position + index) % width === width - 1
  );
  const skip = nextShape.some(index => cellsArray[index + position + width].classList.contains("collide"))

  if (skip && current.shape[0] == current.shape[1]) {
    rotationCount++
    position += 1
  } else if (skip && current.shape[0] == current.shape[3]) {
    rotationCount -= 3
    position -= 1
  } else if (isAtLeftEdge && current.shape[0] == current.shape[1]) {
    rotationCount++
    position += 1
  } else if (isAtRightEdge && current.shape[0] == current.shape[3]) {
    rotationCount -= 3
    position -= 1
  }
}



