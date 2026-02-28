"use client";

import InventoryIcon from "@mui/icons-material/Inventory";
import { Box, Paper, Typography } from "@mui/material";

export default function InventoryServicePage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <InventoryIcon sx={{ fontSize: 32, color: "#6366f1" }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Inventory Service
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Monitor stock levels, track inventory movements, and manage warehouse
          inventory in real time.
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
          Inventory data will appear here.
        </Typography>
      </Paper>
    </Box>
  );
}
