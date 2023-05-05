const cells = document.querySelectorAll("[data-cell]");
const dbRef = firebase.database().ref("tic-tac-toe");

let currentPlayer = "X";
let gameKey = null;

dbRef.on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    gameKey = Object.keys(data)[0];
    const gameState = data[gameKey];
    updateGameState(gameState);
  } else {
    startNewGame();
  }
});

function updateGameState(gameState) {
  gameState.board.forEach((cellState, index) => {
    if (cellState) {
      const cell = cells[index];
      cell.setAttribute("data-player", cellState);
      cell.textContent = cellState;
    }
  });
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
  // Entferne den Listener, bevor das Spiel zurückgesetzt wird
  dbRef.child(gameKey).child("winner").off("value");

  resetFirebaseData();
  clearBoard();
  addClickListeners();
  dbRef.child(gameKey).child("winner").set(null);
}

function startNewGame() {
  gameKey = generateGameKey();
  dbRef.child(gameKey).set({ board: Array(9).fill(null), currentPlayer: "X" });
  addClickListeners();

  // Füge den Listener für das "winner"-Attribut hier hinzu
  dbRef.child(gameKey).child("winner").on("value", (snapshot) => {
    const winner = snapshot.val();
    if (winner) {
      alert(`${winner} wins!`);
      resetGame();
    }
  });
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

  dbRef.child(gameKey).child("board").child(cellIndex).set(currentPlayer);

  if (checkWinner(currentPlayer)) {
    resetFirebaseData(); // Füge dies hinzu, um das Spielbrett in der Datenbank zurückzusetzen
    dbRef.child(gameKey).child("winner").set(currentPlayer);
  } else if (isBoardFull()) {
    resetFirebaseData(); // Füge dies hinzu, um das Spielbrett in der Datenbank zurückzusetzen
    alert("It's a draw!");
    resetGame();
  } else {
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
