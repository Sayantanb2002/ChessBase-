// connecting the frontend socket with the backend
const socket = io();
const chess = new Chess();
const boardElem = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  console.log(board);
  boardElem.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElem = document.createElement("div");
      squareElem.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElem.dataset.row = rowindex;
      squareElem.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElem.appendChild(pieceElement);
      }

      squareElem.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElem.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElem.dataset.row),
            col: parseInt(squareElem.dataset.col),
          };

          handleMove(sourceSquare, targetSource);
        }
      });
      boardElem.appendChild(squareElem);
    });
  });

  if (playerRole === 'b'){
    boardElem.classList.add('flipped');
  }
  else{
    boardElem.classList.remove('flipped');
  }
};

const handleMove = (source , target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    socket.emit("move" , move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        K: "♔",
        Q: "♕",
        B: "♗",
        N: "♘",
        R: "♖",
        P: "U+269",
    };

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole" , (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole" , () => {
    playerRole = null,
    renderBoard();
});

socket.on("boardState" , (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move" , (move) => {
    chess.move(move);
    renderBoard()
})
renderBoard();
