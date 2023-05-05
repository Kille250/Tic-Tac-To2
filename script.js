const cells = document.querySelectorAll("[data-cell]");
const dbRef = firebase.database().ref("tic-tac-toe");

let currentPlayer = "X";
let gameKey = null;

dbRef.on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    gameKey = Object.keys(data)[0];
    const gameState = data[gameKey];
    updateBoard(gameState);
  } else {
    startNewGame();
  }
});

function updateCell(cellIndex, player) {
  const cell = cells[cellIndex];
  cell.setAttribute("data-player", player);
  cell.textContent = player;
}

function addClickListeners() {
  cells.forEach((cell) => {
    cell.addEventListener("click", handleClick, { once: true });
  });
}

function resetFirebaseData() {
  const updates = {};
  for (let i = 0; i < 9; i++) {
    updates[i] = null;
  }
  dbRef.child(gameKey).update(updates);
}

function resetGame() {
  resetFirebaseData();
  clearBoard();
  addClickListeners();
}

function clearBoard() {
  cells.forEach((cell) => {
    cell.removeAttribute("data-player");
    cell.textContent = "";
  });
}

function startNewGame() {
  gameKey = generateGameKey();
  dbRef.child(gameKey).set({ board: Array(9).fill(null), currentPlayer: "X" });
  addClickListeners();
}

function resetBoard() {
  cells.forEach((cell) => {
    cell.removeEventListener("click", handleClick);
  });
  startNewGame();
}

function handleClick(e) {
  const cell = e.target;
  const cellIndex = [...cells].indexOf(cell);
  if (cell.getAttribute("data-player")) {
    return;
  }

  updateCell(cellIndex, currentPlayer);

  if (checkWinner(currentPlayer)) {
    alert(`${currentPlayer} wins!`);
    resetGame();
  } else if (isBoardFull()) {
    alert("It's a draw!");
    resetGame();
  } else {
    dbRef.child(gameKey).child("board").child(cellIndex).set(currentPlayer);
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    dbRef.child(gameKey).child("currentPlayer").set(currentPlayer);
  }
}

function checkWinner(player) {
  const winningPositions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const board = Array.from(cells).map(cell => cell.getAttribute("data-player"));

  return winningPositions.some(position => {
    return position.every(index => {
      return board[index] === player;
    });
  });
}

function isBoardFull() {
  return Array.from(cells).every(cell => cell.getAttribute("data-player"));
}

function generateGameKey() {
  return Math.random().toString(36).substr(2, 9);
}

startNewGame();
