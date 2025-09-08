"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function Loader() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0)", // white with 60% transparency
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999, // make sure it stays on top
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export { Loader };
