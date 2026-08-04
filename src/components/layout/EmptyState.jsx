import { Card, Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function EmptyState({ icon: IconComponent, title, description, action, sx }) {
  return (
    <Card
      sx={{
        py: 8,
        px: 3,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "background.neutral",
        boxShadow: "none",
        ...sx,
      }}
    >
      {IconComponent && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (t) => alpha(t.palette.grey[500], 0.12),
            color: "text.disabled",
          }}
        >
          <IconComponent width={32} height={32} />
        </Box>
      )}
      <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {action}
    </Card>
  );
}
