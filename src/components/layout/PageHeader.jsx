import { Box, Stack, Typography } from "@mui/material";
import { useRevealAnimation } from "../../hooks/useRevealAnimation";

export default function PageHeader({ title, subtitle, action, sx }) {
  const ref = useRevealAnimation();

  return (
    <Stack
      ref={ref}
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ sm: "center" }}
      spacing={2}
      sx={{ mb: 3, ...sx }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontSize: "1.7rem" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Stack>
  );
}
