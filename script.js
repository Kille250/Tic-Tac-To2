const cells = document.querySelectorAll("[data-cell]");
const dbRef = firebase.database().ref("tic-tac-toe");

let currentPlayer = "X";
let gameKey = null;

dbRef.on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    gameKey = Object.keys(data)[0];
    const gameState = data[gameKey];
    // Ersetzen Sie den Aufruf von `updateBoard(gameState)` durch den folgenden Code:
    for (let i = 0; i < 9; i++) {
      if (gameState.board[i]) {
        cells[i].setAttribute("data-player", gameState.board[i]);
        cells[i].textContent = gameState.board[i];
      } else {
        cells[i].removeAttribute("data-player");
        cells[i].textContent = "";
      }
    }
    currentPlayer = gameState.currentPlayer;
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
  gameKey = generateGameKey();
  dbRef.child(gameKey).set({ board: Array(9).fill(null), currentPlayer: "X" });
  dbRef.child(gameKey).on("value", (snapshot) => {
    const gameState = snapshot.val();
    for (let i = 0; i < 9; i++) {
      if (gameState.board[i]) {
        cells[i].setAttribute("data-player", gameState.board[i]);
        cells[i].textContent = gameState.board[i];
      } else {
        cells[i].removeAttribute("data-player");
        cells[i].textContent = "";
      }
    }
    currentPlayer = gameState.currentPlayer;
  });

  addClickListeners();
}

function resetBoard() {
  resetFirebaseData();
  cells.forEach((cell) => {
    cell.removeAttribute("data-player");
    cell.textContent = "";
  });
  addClickListeners();
  startNewGame();
}

function updateCell(cellIndex, player) {
  const cell = cells[cellIndex];
  cell.setAttribute("data-player", player);
  cell.textContent = player;
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
    resetBoard();
  } else if (isBoardFull()) {
    alert("It's a draw!");
    resetBoard();
  } else {
    dbRef.child(gameKey).child(cellIndex).set(currentPlayer);
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

cells.forEach(cell => {
  cell.addEventListener("click", handleClick, { once: true });
});
