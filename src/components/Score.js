import React from "react";
import { Typography } from "@mui/material";

function Score({ score }) {
  return (
    <Typography variant="h5" align="center" style={{ marginBottom: 20 }}>
      Puntaje: {score}
    </Typography>
  );
}

export default Score;
