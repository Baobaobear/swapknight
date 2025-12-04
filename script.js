(() => {
  const DEFAULT_LAYOUT = [".1..", ".00.", ".010", "2020"];

  const cloneLayout = (rows) => rows.map((row) => row.split(""));

  const appendKnightImage = (target, type) => {
    const img = document.createElement("img");
    img.src = type === "1" ? "knight-white.png" : "knight-black.png";
    img.alt = type === "1" ? "White knight" : "Black knight";
    img.className = "knight-img";
    target.appendChild(img);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const layoutStrings =
      Array.isArray(window.knightLayout) && window.knightLayout.length > 0
        ? window.knightLayout
        : DEFAULT_LAYOUT;

    let board = cloneLayout(layoutStrings);
    const startBoard = cloneLayout(layoutStrings);
    const boardWidth = startBoard[0]?.length || 0;
    const boardHeight = startBoard.length;

    const boardEl = document.getElementById("board");
    const previewEl = document.getElementById("previewBoard");
    const messageEl = document.getElementById("message");
    const moveCountEl = document.getElementById("moveCount");
    const resetBtn = document.getElementById("resetBtn");

    if (!boardEl || !previewEl || !messageEl || !moveCountEl || !resetBtn) {
      return;
    }

    const whiteStart = [];
    const blackStart = [];

    startBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === "1") {
          whiteStart.push(`${r},${c}`);
        } else if (cell === "2") {
          blackStart.push(`${r},${c}`);
        }
      });
    });

    const whiteGoal = [...blackStart].sort().join("|");
    const blackGoal = [...whiteStart].sort().join("|");
    let selected = null;
    let moveCount = 0;
    let pieces = [];
    let cells = [];
    let isSoundEnabled = true;

    const updateMoveCount = () => {
      moveCountEl.textContent = moveCount;
    };
    
    const soundToggleBtn = document.getElementById("soundToggle");
    const toggleSound = () => {
      isSoundEnabled = !isSoundEnabled;
      soundToggleBtn.textContent = isSoundEnabled ? "Sound On" : "Sound Off";
    };
    soundToggleBtn.addEventListener("click", toggleSound);

    const getButton = (r, c) =>
      cells.find(
        (cell) => cell.dataset.row == r && cell.dataset.col == c
      );

    const getPiece = (r, c) =>
      pieces.find(
        (piece) => piece.dataset.row == r && piece.dataset.col == c
      );

    const createBoard = () => {
      boardEl.style.setProperty("--cols", boardWidth);
      boardEl.innerHTML = "";
      pieces = [];
      cells = [];

      board.forEach((row, r) => {
        row.forEach((cell, c) => {
          const btn = document.createElement("button");
          btn.className = cell === "." ? "void" : "cell";
          if (cell !== ".") {
            btn.addEventListener("click", () => handleClick(r, c));
          }
          btn.dataset.row = r;
          btn.dataset.col = c;
          boardEl.appendChild(btn);
          cells.push(btn);

          if (cell === "1" || cell === "2") {
            const piece = document.createElement("div");
            piece.className = "piece";
            piece.dataset.row = r;
            piece.dataset.col = c;
            appendKnightImage(piece, cell);
            boardEl.appendChild(piece);
            pieces.push(piece);
          }
        });
      });
      updatePieces();
    };
    
    const updatePieces = () => {
      const cellWidth = cells[0].offsetWidth;
      const cellHeight = cells[0].offsetHeight;
      const gap = 4;

      pieces.forEach((piece) => {
        const r = piece.dataset.row;
        const c = piece.dataset.col;
        const x = c * (cellWidth + gap) + 8; // 加上棋盘的padding
        const y = r * (cellHeight + gap) + 8; // 加上棋盘的padding
        let transform = `translate(${x}px, ${y}px)`;
        if (piece.classList.contains("selected-piece")) {
          transform += " scale(1.1)";
        }
        piece.style.transform = transform;
        piece.style.width = `${cellWidth}px`;
        piece.style.height = `${cellHeight}px`;
      });
    };

    const markTargets = (sr, sc) => {
      const moves = [
        [sr + 2, sc + 1],
        [sr + 2, sc - 1],
        [sr - 2, sc + 1],
        [sr - 2, sc - 1],
        [sr + 1, sc + 2],
        [sr + 1, sc - 2],
        [sr - 1, sc + 2],
        [sr - 1, sc - 2],
      ];
      moves.forEach(([r, c]) => {
        if (board[r] && board[r][c] === "0") {
          const btn = getButton(r, c);
          if (btn) {
            btn.classList.add("target");
          }
        }
      });
    };

    const updateSelection = () => {
      cells.forEach((cell) => {
        cell.classList.remove("selected", "target");
      });
      pieces.forEach((piece) => {
        piece.classList.remove("selected-piece");
      });
      if (selected) {
        const selectedBtn = getButton(selected.r, selected.c);
        if (selectedBtn) {
          selectedBtn.classList.add("selected");
        }
        const selectedPiece = getPiece(selected.r, selected.c);
        if (selectedPiece) {
          selectedPiece.classList.add("selected-piece");
        }
        markTargets(selected.r, selected.c);
      }
      updatePieces();
    };

    const createPreviewBoard = () => {
      previewEl.style.setProperty("--cols", boardWidth);
      previewEl.innerHTML = "";
      startBoard.forEach((row, r) => {
        row.forEach((cell, c) => {
          const tile = document.createElement("div");
          tile.className = cell === "." ? "void" : "cell";
          if (cell === "1" || cell === "2") {
            const piece = document.createElement("div");
            piece.className = "piece";
            appendKnightImage(piece, cell);
            tile.appendChild(piece);
          }
          previewEl.appendChild(tile);
        });
      });
    };

    const canMove = (sr, sc, tr, tc) => {
      const dr = Math.abs(tr - sr);
      const dc = Math.abs(tc - sc);
      return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
    };

    const coordKey = (r, c) => `${r},${c}`;

    const checkWin = () => {
      const whiteNow = [];
      const blackNow = [];
      board.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell === "1") whiteNow.push(coordKey(r, c));
          if (cell === "2") blackNow.push(coordKey(r, c));
        });
      });
      const whiteMatch = whiteNow.sort().join("|") === whiteGoal;
      const blackMatch = blackNow.sort().join("|") === blackGoal;
      if (whiteMatch && blackMatch) {
        messageEl.textContent = "成功！所有骑士都完成互换。";
      }
    };

    const handleClick = (r, c) => {
      const cell = board[r][c];
      if (cell === ".") return;
      if (cell === "1" || cell === "2") {
        if (selected && selected.r === r && selected.c === c) {
          selected = null;
        } else {
          selected = { r, c };
        }
        updateSelection();
        return;
      }

      if (cell === "0" && selected) {
        if (!canMove(selected.r, selected.c, r, c)) {
          return;
        }
        const piece = getPiece(selected.r, selected.c);
        piece.dataset.row = r;
        piece.dataset.col = c;
        
        board[r][c] = board[selected.r][selected.c];
        board[selected.r][selected.c] = "0";
        selected = { r, c };
        updatePieces();
        updateSelection();
        moveCount += 1;
        updateMoveCount();
        checkWin();
        if (isSoundEnabled) {
          document.getElementById('moveSound')?.play();
        }
      }
    };

    const resetGame = () => {
      board = cloneLayout(layoutStrings);
      selected = null;
      moveCount = 0;
      updateMoveCount();
      messageEl.textContent = "";
      createBoard();
      updateSelection();
    };

    createPreviewBoard();
    createBoard();
    updateSelection();
    updateMoveCount();
    messageEl.textContent = "";
    resetBtn.addEventListener("click", resetGame);

    new ResizeObserver(updatePieces).observe(boardEl);
  });
})();