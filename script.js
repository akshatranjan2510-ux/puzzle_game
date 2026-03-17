let puzzle = document.getElementById("puzzle");
let timeEl = document.getElementById("time");
let movesEl = document.getElementById("moves");

let tiles = [];
let moves = 0;
let time = 0;
let timer;
let gameOver = false;
let imageSrc = "";

/* ---------------- THEME ---------------- */
let toggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggle.innerText = "☀ Light Mode";
}

toggle.onclick = () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    toggle.innerText = "☀ Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    toggle.innerText = "🌙 Dark Mode";
  }
};

/* ---------------- IMAGE UPLOAD ---------------- */
document.getElementById("upload").addEventListener("change", function(e) {
  let file = e.target.files[0];
  imageSrc = URL.createObjectURL(file);
  createPuzzle();

  setTimeout(() => {
    shuffle();   // ✅ auto shuffle
  }, 100);
});

/* ---------------- CREATE PUZZLE ---------------- */
function createPuzzle() {
  puzzle.innerHTML = "";
  tiles = [];
  moves = 0;
  time = 0;
  gameOver = false;

  movesEl.innerText = 0;
  timeEl.innerText = 0;

  clearInterval(timer);
  timer = setInterval(() => {
    time++;
    timeEl.innerText = time;
  }, 1000);

  for (let i = 0; i < 9; i++) {
    let tile = document.createElement("div");
    tile.className = "tile";
    tile.draggable = true;

    let x = (i % 3) * 100;
    let y = Math.floor(i / 3) * 100;

    tile.style.backgroundImage = `url(${imageSrc})`;
    tile.style.backgroundPosition = `-${x}px -${y}px`;

    tile.dataset.correct = i;   // ✅ CORRECT POSITION
    tile.dataset.current = i;   // ✅ CURRENT POSITION

    tile.addEventListener("dragstart", dragStart);
    tile.addEventListener("dragover", e => e.preventDefault());
    tile.addEventListener("drop", drop);

    puzzle.appendChild(tile);
    tiles.push(tile);
  }

  loadBestScore();
}

/* ---------------- DRAG DROP ---------------- */
let dragged;

function dragStart() {
  if (gameOver) return;
  dragged = this;
}

function drop() {
  if (gameOver) return;

  // swap background
  let tempBg = this.style.backgroundPosition;
  this.style.backgroundPosition = dragged.style.backgroundPosition;
  dragged.style.backgroundPosition = tempBg;

  // ✅ swap dataset (IMPORTANT)
  let tempIndex = this.dataset.current;
  this.dataset.current = dragged.dataset.current;
  dragged.dataset.current = tempIndex;

  moves++;
  movesEl.innerText = moves;

  checkWin();
}

/* ---------------- SHUFFLE ---------------- */
function shuffle() {
  if (!imageSrc) return;

  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));

      let tempBg = tiles[i].style.backgroundPosition;
      tiles[i].style.backgroundPosition = tiles[j].style.backgroundPosition;
      tiles[j].style.backgroundPosition = tempBg;

      let tempIndex = tiles[i].dataset.current;
      tiles[i].dataset.current = tiles[j].dataset.current;
      tiles[j].dataset.current = tempIndex;
    }
  } while (isAlreadySolved()); // 🔥 ensure not solved

  moves = 0;
  time = 0;
  movesEl.innerText = 0;
  timeEl.innerText = 0;
}

function isAlreadySolved() {
  return tiles.every(tile => tile.dataset.correct === tile.dataset.current);
}

/* ---------------- PREVIEW ---------------- */
function preview() {
  if (!imageSrc) return;

  gameOver = true; // ⛔ stop moves during preview

  // create overlay preview
  let previewDiv = document.createElement("div");
  previewDiv.id = "previewBox";

  previewDiv.innerHTML = `
    <img src="${imageSrc}" />
  `;

  document.body.appendChild(previewDiv);

  // remove after 2 seconds
  setTimeout(() => {
    previewDiv.remove();
    gameOver = false;
  }, 2000);
}
/* ---------------- CHECK WIN ---------------- */
function checkWin() {
  let win = true;

  tiles.forEach(tile => {
    if (tile.dataset.correct !== tile.dataset.current) {
      win = false;
    }
  });

  if (win) {
    gameOver = true;
    clearInterval(timer);

    document.getElementById("overlay").style.display = "flex";
    document.getElementById("final").innerText =
      `Time: ${time}s | Moves: ${moves}`;
    document.getElementById("winSound").play();

    saveBestScore();

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  }
}


/* ---------------- BEST SCORE ---------------- */
function saveBestScore() {
  let bestTime = localStorage.getItem("bestTime");
  let bestMoves = localStorage.getItem("bestMoves");

  if (!bestTime || time < bestTime) {
    localStorage.setItem("bestTime", time);
  }

  if (!bestMoves || moves < bestMoves) {
    localStorage.setItem("bestMoves", moves);
  }

  loadBestScore();
}

function loadBestScore() {
  document.getElementById("bestTime").innerText =
    localStorage.getItem("bestTime") || "--";

  document.getElementById("bestMoves").innerText =
    localStorage.getItem("bestMoves") || "--";
}

/* ---------------- RESTART ---------------- */
function restart() {
  location.reload();
}