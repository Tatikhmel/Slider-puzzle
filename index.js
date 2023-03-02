"use strict";
///////////////////////////////////////////////////////////////////////////
// Elements
const body = document.body;
const root = document.querySelector(".root");
const buttons = document.createElement("div");
const table = document.querySelector(".table");
const timeAndMoves = document.createElement("div");

let cubes = []; // an array which consists of a complete data set on cubes: left / right coordinates and value.
let gameRoundResults = { round: [], boardSize: [], moves: [], time: [] }; // data for records table

let cubesArray = []; // an array of cubes' values that is gonna be used for shuffle

let sec = 0;
let min = 0;
let hrs = 0;
let countMoves = 0;
let gameRound = 0;
let level = 0; // shows in the records table which board size (3X3, 4X4, 5X5, 6X6, 7x7 or 8X8) was chosen.
let cube, timer, left, top, tr, td, results;
let cubeSize;
let boardSize; // the total number of cubes
let rowColumnLength; // the number of cubes horizontally and vertically

let blankSpace = document.querySelector(".blank_space");
blankSpace = {
  // blank space coords
};

// calculating coordinates of each cube and setting style
function getCoords(a, b) {
  return Math.abs(a - b);
}

function setElementStyle(a, b) {
  return `${a * b}px`;
}

// changing position of cubes
function changePosition(i) {
  let cube = cubes[i];
  const blankSpaceLeft = blankSpace.left;
  const blankSpaceTop = blankSpace.top;

  let coordsLeft = getCoords(blankSpace.left, cube.left);
  let coordsTop = getCoords(blankSpace.top, cube.top);

  if (
    (blankSpaceLeft === cube.left && blankSpaceTop === cube.top) ||
    coordsLeft + coordsTop > 1
  ) {
    return;
  } else {
    countMoves++;
    calcMoves.textContent = `Moves: ${countMoves}`;
  }

  cube.element.style.left = setElementStyle(blankSpace.left, cubeSize);
  cube.element.style.top = setElementStyle(blankSpace.top, cubeSize);

  blankSpace.top = cube.top;
  blankSpace.left = cube.left;
  cube.top = blankSpaceTop;
  cube.left = blankSpaceLeft;

  const winCondition = cubes.every(
    (cube) => cube.value - 1 === cube.top * rowColumnLength + cube.left
  );

  if (winCondition) {
    winAnnouncement();
    clearInterval(timer);
    gameRound++;

    gameRoundResults.round.push(gameRound);
    gameRoundResults.boardSize.push(level);
    gameRoundResults.moves.push(countMoves);
    gameRoundResults.time.push(setTimer.textContent);

    localStorage.setItem("round", gameRoundResults.round);
    localStorage.setItem("boardSize", gameRoundResults.boardSize);
    localStorage.setItem("moves", gameRoundResults.moves);
    localStorage.setItem("time", gameRoundResults.time);
  }
}

// resetting the game, so after clicking on a shuffle button the original game board won't overlay newly shuffled cubes
const resetGame = () => {
  clearInterval(timer);
  setTimer.textContent = `Time: 00:00:00`;
  countMoves = 0;
  calcMoves.textContent = `Moves: ${countMoves}`;
  [...root.children].forEach((el) => {
    root.removeChild(el); //removing cubes from the board
  });

  cubes.splice(0); // deleting all elements starting from index 0
  blankSpace.top = 0; // resetting coordinates
  blankSpace.left = 0;
};

// creating a timer
const setTimer = document.createElement("div");
setTimer.classList.add("timer");
setTimer.textContent = `Time: 00:00:00`;
buttons.append(setTimer);

function startTimer() {
  timer = setInterval(() => {
    setTimer.textContent =
      "Time: " +
      `${hrs}`.padStart(2, 0) +
      ":" +
      `${min}`.padStart(2, 0) +
      ":" +
      `${sec}`.padStart(2, 0);
    sec++;

    if (sec >= 60) {
      sec = 0;
      min++;
    } else if (min >= 60) {
      min = 0;
      hrs++;
    }
  }, 1000);
}

// creating moves counter
const calcMoves = document.createElement("div");
calcMoves.classList.add("count_moves");
calcMoves.textContent = `Moves: ${countMoves}`;
buttons.append(calcMoves);

function saveGame() {
  localStorage.setItem("savedBoardSize", level);
  localStorage.setItem("savedMoves", countMoves);
  localStorage.setItem("savedTime", setTimer.textContent);
  localStorage.setItem("savedCubesPosition", JSON.stringify(cubes));
}

function loadGame() {
  let savedCubes = JSON.parse(localStorage.getItem("savedCubesPosition"));
  for (let i = 0; i < savedCubes.length; i++) {
    resetGame();
    level = localStorage.getItem("savedBoardSize");
    countMoves = parseInt(localStorage.getItem("savedMoves"));
    calcMoves.textContent = `Moves: ${countMoves}`;
    setTimer.textContent = localStorage.getItem("savedTime");
    setPosition();
    [cubes[i]] = [savedCubes[i]];
  }
}

////////////////////////////////////////////////////////////////////////////////////
// Creating buttons using OOP and adding event listeners to each of them

class Button {
  constructor(name, attribute, classList, textContent) {
    this.name = document.createElement("button");
    this.name.setAttribute("id", attribute);
    this.name.classList.add(classList);
    this.textContent = this.name.textContent = textContent;
    buttons.append(this.name);
  }

  //Methods that will be added to .prototype property
  addEventShuffle() {
    this.name.addEventListener("click", function () {
      setPosition();
      shuffle(cubesArray);
    });
  }

  addEventSave(cubes) {
    this.name.addEventListener("click", function () {
      saveGame(cubes);
    });
  }

  addEventLoad() {
    this.name.addEventListener("click", function () {
      loadGame(countMoves);
    });
  }

  addEventResult() {
    this.name.addEventListener("click", function () {
      createRecordsTable();
      showResults();
    });
  }

  clickOnlyOnce() {
    this.name.addEventListener("click", function () {
      this.disabled = "disabled";
    });
  }

  clickOnlyOnceDisabled() {
    this.name.removeAttribute("disabled");
  }

  renderCubesNumber(number) {
    this.name.addEventListener("click", function () {
      resetGame();
      level = number;
      rowColumnLength = number;
      boardSize = Math.pow(number, 2);
      cubeSize = 128 - boardSize;
      cubesArray = [];
      cubesArray.push(...Array(boardSize).keys());
      setPosition(boardSize, rowColumnLength);
      shuffle(cubesArray);
    });
  }
}

const shuffleButton = new Button(
  "shuffleButton",
  "button",
  "shuffleButton",
  "SHUFFLE"
);
const saveButton = new Button("saveButton", "button", "saveButton", "SAVE");
const loadButton = new Button("stopButton", "button", "stopButton", "LOAD");
const resultsButton = new Button(
  "resultsButton",
  "button",
  "resultsButton",
  "RESULT"
);

shuffleButton.addEventShuffle();
loadButton.addEventLoad();
saveButton.addEventSave();
resultsButton.addEventResult();
resultsButton.clickOnlyOnce();

// Creating size buttons

const renderSizeButtons = function () {
  for (let i = 3; i <= 8; i++) {
    new Button(
      "rowsCols",
      "button",
      "row_col_length",
      `${i}X${i}`
    ).renderCubesNumber(i);
  }
};

renderSizeButtons();

// implementing shuffle functionality

function shuffle(cubesArray) {
  for (let i of cubesArray) {
    resetGame(); // deleting original game board
    setPosition(boardSize, rowColumnLength); // creating a new shuffled game board
    startTimer();

    let j = Math.floor(Math.random() * (i + 1));
    [cubesArray[i], cubesArray[j]] = [cubesArray[j], cubesArray[i]];
  }
}

////////////////////////////////////////////////////////////////////////////////////
// Creating banners using OOP
class Banner {
  constructor(name, classList, textContent, bannerMessage, bannerMessageClass) {
    this.name = document.createElement("div");
    this.name.classList.add(classList);
    this.bannerMessage = document.createElement("h2");
    this.bannerMessage.classList.add(bannerMessageClass);
    this.bannerMessage.textContent = textContent;
    root.append(this.bannerMessage);
    root.append(this.name);
  }

  removeBanner() {
    this.name.addEventListener("click", () => {
      resultBanner.classList.remove("result_banner");
      resultsButton.clickOnlyOnceDisabled();
    });
  }
}

const startBanner = new Banner(
  "startBanner",
  "start_banner",
  `Welcome to Slider puzzle challenge! Choose the board size to start the game!`,
  "bannerMessage",
  "banner_message"
);

// create pop-up if the user wins
function winAnnouncement() {
  const winMessage = new Banner(
    "winAnnounce",
    "win_announce",
    `Congrats! You solved the puzzle! Moves: ${countMoves} | ${setTimer.textContent}`,
    "winMessage",
    "win_message"
  );
}

// Creating a result banner
function showResults() {
  const resultBanner = document.createElement("div");
  resultBanner.classList.add("result_banner");
  const closeBanner = document.createElement("div");
  closeBanner.classList.add("close_banner");
  root.append(resultBanner);
  table.append(closeBanner);
  createRecordsTable();

  const resultMessage = document.createElement("h2");
  resultMessage.classList.add("banner_message");
  resultBanner.append(resultMessage);

  closeBanner.addEventListener("click", () => {
    resultBanner.classList.remove("result_banner");
    resultsButton.clickOnlyOnceDisabled();
    [...table.children].forEach((el) => {
      table.removeChild(el); //removing elements from the board
    });
  });
}

function createRecordsTable() {
  const recordsTable = document.createElement("table");
  recordsTable.classList.add("score_table");

  for (let i = 0; i < 11; i++) {
    tr = recordsTable.insertRow();
    td = tr.insertCell();

    let getMovesResult = localStorage.getItem("moves").split(",");
    let getBoardSizeResult = localStorage.getItem("boardSize").split(",");
    let getRoundResult = localStorage.getItem("round").split(",");
    let getTimeResult = localStorage.getItem("time").split(",");

    td.appendChild(
      document.createTextNode(
        `Round: ${getRoundResult[i] || i + 1} | Board size: ${
          getBoardSizeResult[i] || 0
        } | Moves: ${getMovesResult[i] || "0"} | ${
          getTimeResult[i] || "Time: 00:00:00"
        }`
      )
    );

    td.style.border = "1px solid black";
  }
  table.appendChild(recordsTable);
}

buttons.classList.add("button");
body.append(buttons);

// changing cubes style according to the boardSize
const changeCubeStyle = function () {
  if (cubeSize === 119) {
    cube.style.width = "100px";
    cube.style.height = "100px";
    cube.style.transform = "translate(80%, 145%)";
    cube.style.fontSize = "30px";
  } else if (cubeSize === 112) {
    cube.style.width = "90px";
    cube.style.height = "90px";
    cube.style.transform = "translate(40%, 115%)";
    cube.style.fontSize = "30px";
  } else if (cubeSize === 103) {
    cube.style.width = "85px";
    cube.style.height = "85px";
    cube.style.transform = "translate(-3%, 100%)";
    cube.style.fontSize = "28px";
  } else if (cubeSize === 92) {
    cube.style.width = "75px";
    cube.style.height = "75px";
    cube.style.fontSize = "23px";
    cube.style.transform = "translate(-20%, 110%)";
  } else if (cubeSize === 79) {
    cube.style.width = "65px";
    cube.style.height = "65px";
    cube.style.fontSize = "20px";
    cube.style.transform = "translate(-25%, 130%)";
  } else {
    cube.style.width = "55px";
    cube.style.height = "55px";
    cube.style.fontSize = "16px";
    cube.style.transform = "translate(0%, 185%)";
  }
};

let cubesValueArray = [];

// creating cubes
function setPosition() {
  for (let i = 0; i < boardSize; i++) {
    cube = document.createElement("div");
    cube.classList.add("cube");
    const value = cubesArray[i] + 1; // adding +1 to the cubes' values to start the order from 1 (123...) instead of 0 (0123...)
    cube.textContent = value;

    left = i % rowColumnLength; // setting horizontal position
    cube.style.left = setElementStyle(cubeSize, left);
    top = (i - left) / rowColumnLength; // setting vertical position
    cube.style.top = setElementStyle(cubeSize, top);
    root.append(cube);

    changeCubeStyle();

    if (value === boardSize) {
      // separating basic cubes with a blank space which is going to be the 16th cube
      cube.classList.add("blank_space"); // adding a class to the last cube, so it'll be possible to hide it using css
      blankSpace.top = top;
      blankSpace.left = left;
      blankSpace.value = value;
      blankSpace.element = cube;
      cubes.push(blankSpace);
    } else {
      cubes.push({
        top: top,
        left: left,
        value: value,
        element: cube,
      });
    }

    cube.addEventListener("click", () => {
      changePosition(i);
    });
  }
}
