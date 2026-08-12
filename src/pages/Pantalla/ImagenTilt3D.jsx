import { motion } from "framer-motion";
import { Box } from "@mui/material";
import { useTilt3D } from "./useTilt3D";
import "./productScene.css";

function seedFrom(n) {
  const x = Number(n) || 0;
  return ((x * 9301 + 49297) % 233280) / 233280;
}

export default function ImagenTilt3D({ imagenUrl, size, seed, fallback, bgColor }) {
  const { ref, style, handlers } = useTilt3D();
  const s = seedFrom(seed);

  return (
    <Box sx={{ width: size, aspectRatio: "1", perspective: typeof size === "number" ? size * 2 : 800 }}>
      <Box
        ref={ref}
        component={motion.div}
        style={style}
        {...handlers}
        className="notiya-tilt-ambient"
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: "inherit",
          bgcolor: bgColor,
          backgroundImage: imagenUrl ? `url(${imagenUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "--tilt-delay": `${s * 3}s`,
          "--tilt-amp": `${4 + s * 3}deg`,
        }}
      >
        {!imagenUrl && fallback}
      </Box>
    </Box>
  );
}
