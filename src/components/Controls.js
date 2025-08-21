import React from "react";
import { Button, ButtonGroup } from "@mui/material";

function Controls() {
  // Aquí irán los controles del juego
  return (
    <ButtonGroup variant="contained" fullWidth style={{ marginTop: 20 }}>
      <Button>Izquierda</Button>
      <Button>Rotar</Button>
      <Button>Derecha</Button>
      <Button>Abajo</Button>
    </ButtonGroup>
  );
}

export default Controls;
