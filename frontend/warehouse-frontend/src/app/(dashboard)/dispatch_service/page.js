"use client";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { Box, Paper, Typography } from "@mui/material";

export default function DispatchServicePage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <LocalShippingIcon sx={{ fontSize: 32, color: "#6366f1" }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Dispatch Service
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Oversee dispatch operations, track shipments, and manage outbound
          deliveries from the warehouse.
        </Typography>
      </Box>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body1" sx={{ color: "#94a3b8" }}>
          Dispatch data will appear here.
        </Typography>
      </Paper>
    </Box>
  );
}
