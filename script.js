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
      (Array.isArray(window.knightLayout) && window.knightLayout.length > 0
        ? window.knightLayout
        : DEFAULT_LAYOUT);

    let board = cloneLayout(layoutStrings);
    const startBoard = cloneLayout(layoutStrings);
    const boardWidth = startBoard[0]?.length || 0;

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

    const updateMoveCount = () => {
      moveCountEl.textContent = moveCount;
    };

    const getButton = (r, c) =>
      boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);

    const createBoard = () => {
      boardEl.style.setProperty("--cols", boardWidth);
      boardEl.innerHTML = "";
      board.forEach((row, r) => {
        row.forEach((cell, c) => {
          const btn = document.createElement("button");
          btn.className = cell === "." ? "void" : "cell";
          if (cell !== ".") {
            btn.addEventListener("click", () => handleClick(r, c));
            const piece = document.createElement("div");
            piece.className = "piece";
            if (cell === "1" || cell === "2") {
              appendKnightImage(piece, cell);
            }
            btn.appendChild(piece);
          }
          btn.dataset.row = r;
          btn.dataset.col = c;
          boardEl.appendChild(btn);
        });
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

    const updateBoard = () => {
      board.forEach((row, r) => {
        row.forEach((cell, c) => {
          const btn = getButton(r, c);
          if (!btn || btn.classList.contains("void")) return;
          btn.classList.remove("selected", "target");
          btn.innerHTML = "";
          if (cell === "1" || cell === "2") {
            const piece = document.createElement("div");
            piece.className = "piece";
            appendKnightImage(piece, cell);
            btn.appendChild(piece);
          }
        });
      });
      if (selected) {
        const selectedBtn = getButton(selected.r, selected.c);
        if (selectedBtn) {
          selectedBtn.classList.add("selected");
        }
        markTargets(selected.r, selected.c);
      }
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
        updateBoard();
        return;
      }

      if (cell === "0" && selected) {
        if (!canMove(selected.r, selected.c, r, c)) {
          return;
        }
        board[r][c] = board[selected.r][selected.c];
        board[selected.r][selected.c] = "0";
        selected = { r, c };
        updateBoard();
        moveCount += 1;
        updateMoveCount();
        checkWin();
      }
    };

    const resetGame = () => {
      board = cloneLayout(layoutStrings);
      selected = null;
      moveCount = 0;
      updateMoveCount();
      messageEl.textContent = "";
      updateBoard();
    };

    createPreviewBoard();
    createBoard();
    updateBoard();
    updateMoveCount();
    messageEl.textContent = "";
    resetBtn.addEventListener("click", resetGame);
  });
})();
