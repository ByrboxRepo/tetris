import React, { useState } from "react";
import { Container, Typography } from "@mui/material";
import Board from "./components/Board";
import Score from "./components/Score";
import Controls from "./components/Controls";

function App() {
  const [score, setScore] = useState(0);

  return (
    <Container maxWidth="sm" style={{ marginTop: 40 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Tetris Moderno
      </Typography>
      <Score score={score} />
      <Board score={score} setScore={setScore} />
      <Controls />
    </Container>
  );
}

export default App;
