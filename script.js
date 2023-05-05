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

function startNewGame() {
  const initialGameState = Array(9).fill("");
  gameKey = dbRef.push().key;
  dbRef.child(gameKey).set(initialGameState);
  addClickListeners();
}

function resetBoard() {
  resetFirebaseData();
  cells.forEach((cell) => {
    cell.removeAttribute("data-player");
    cell.textContent = "";
    cell.removeEventListener("click", handleClick);
  });
  addClickListeners();
  startNewGame();
}

function updateBoard(gameState) {
  gameState.forEach((cellState, index) => {
    if (cellState) {
      const cell = cells[index];
      cell.setAttribute("data-player", cellState);
      cell.textContent = cellState;
    }
  });
}

function handleClick(e) {
  const cell = e.target;
  const cellIndex = [...cells].indexOf(cell);
  if (cell.getAttribute("data-player")) {
    return;
  }

  cell.setAttribute("data-player", currentPlayer);
  cell.textContent = currentPlayer;

  if (checkWinner(currentPlayer)) {
    alert(`${currentPlayer} wins!`);
    resetBoard();
  } else if (isBoardFull()) {
    alert("It's a draw!");
    resetBoard();
  } else {
    dbRef.child(gameKey).child(cellIndex).set(currentPlayer);
    currentPlayer = currentPlayer === "X" ? "O" : "X";
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

cells.forEach(cell => {
  cell.addEventListener("click", handleClick, { once: true });
});
