import React, { useState, useEffect, useCallback } from "react";
import { Paper } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";
// Sonidos genéricos (puedes reemplazar por archivos propios en public/sounds)
const moveSound = "/sounds/move.mp3";
const rotateSound = "/sounds/rotate.mp3";
const lineSound = "/sounds/line.mp3";
const gameOverSound = "/sounds/gameover.mp3";

const ROWS = 20;
const COLS = 10;

// Definición de piezas y rotaciones
const TETROMINOS = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  ],
};

const COLORS = {
  I: "#00f0f0",
  J: "#0000f0",
  L: "#f0a000",
  O: "#f0f000",
  S: "#00f000",
  T: "#a000f0",
  Z: "#f00000",
};

function randomTetromino() {
  const keys = Object.keys(TETROMINOS);
  const rand = keys[Math.floor(Math.random() * keys.length)];
  return { type: rand, rotation: 0, shape: TETROMINOS[rand][0] };
}

function Board({ score, setScore }) {
  const [playMove] = useSound(moveSound, { volume: 0.5 });
  const [playRotate] = useSound(rotateSound, { volume: 0.5 });
  const [playLine] = useSound(lineSound, { volume: 0.5 });
  const [playGameOver] = useSound(gameOverSound, { volume: 0.5 });
  const [board, setBoard] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const [current, setCurrent] = useState(randomTetromino());
  const [pos, setPos] = useState({ x: 3, y: 0 });
  const [gameOver, setGameOver] = useState(false);

  // Colisión
  const isValid = useCallback(
    (shape, x, y) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const newY = y + r;
            const newX = x + c;
            if (
              newY < 0 ||
              newY >= ROWS ||
              newX < 0 ||
              newX >= COLS ||
              (board[newY] && board[newY][newX])
            ) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [board]
  );

  // Fijar pieza y limpiar líneas
  const placeTetromino = useCallback(() => {
    const newBoard = board.map((row) => [...row]);
    current.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const y = pos.y + r;
          const x = pos.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            newBoard[y][x] = current.type;
          }
        }
      });
    });
    // Limpiar líneas
    let lines = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r].every((cell) => cell)) {
        newBoard.splice(r, 1);
        newBoard.unshift(Array(COLS).fill(null));
        lines++;
      }
    }
    if (lines > 0) playLine();
    setScore((prev) => prev + lines * 100);
    setBoard(newBoard);
    // Nueva pieza
    const next = randomTetromino();
    setCurrent(next);
    setPos({ x: 3, y: 0 });
    // Si colisiona al aparecer, game over
    if (!isValid(next.shape, 3, 0)) {
      setGameOver(true);
      playGameOver();
    }
  }, [board, current, pos, isValid]);

  // Movimiento automático hacia abajo
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      move(0, 1);
    }, 500);
    return () => clearInterval(interval);
  });

  // Movimiento y rotación
  const move = (dx, dy) => {
    if (gameOver) return;
    const { shape } = current;
    const newX = pos.x + dx;
    const newY = pos.y + dy;
    if (isValid(shape, newX, newY)) {
      setPos({ x: newX, y: newY });
      playMove();
    } else if (dy === 1) {
      placeTetromino();
    }
  };

  const rotate = () => {
    if (gameOver) return;
    const { type, rotation } = current;
    const nextRotation = (rotation + 1) % TETROMINOS[type].length;
    const nextShape = TETROMINOS[type][nextRotation];
    if (isValid(nextShape, pos.x, pos.y)) {
      setCurrent({ type, rotation: nextRotation, shape: nextShape });
      playRotate();
    }
  };

  // Controles de teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowUp") rotate();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Renderizar tablero
  const renderBoard = () => {
    // Copia del tablero para renderizar la pieza actual
    const display = board.map((row) => [...row]);
    current.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const y = pos.y + r;
          const x = pos.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            display[y][x] = current.type;
          }
        }
      });
    });
    return display.map((row, r) => (
      <div key={r} style={{ display: "flex" }}>
        {row.map((cell, c) => (
          <motion.div
            key={c}
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 30,
              height: 30,
              background: cell ? COLORS[cell] : "#222",
              border: "1px solid #333",
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <Paper
      elevation={3}
      style={{
        width: 300,
        height: 600,
        margin: "20px auto",
        background: "#222",
        padding: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {gameOver ? (
          <motion.div
            key="explosion"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1.5,
              background: "radial-gradient(circle, #ff0000 0%, #222 100%)",
            }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 32,
            }}
          >
            <h2>Game Over</h2>
            <p>Puntaje: {score}</p>
            <span style={{ fontSize: 48, color: "#ff0000" }}>💥</span>
          </motion.div>
        ) : (
          renderBoard()
        )}
      </AnimatePresence>
    </Paper>
  );
}

export default Board;
