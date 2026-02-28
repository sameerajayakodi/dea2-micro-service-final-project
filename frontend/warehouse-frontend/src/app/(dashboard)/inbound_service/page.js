"use client";

import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import { Box, Paper, Typography } from "@mui/material";

export default function InboundServicePage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <MoveToInboxIcon sx={{ fontSize: 32, color: "#6366f1" }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Inbound Service
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Manage incoming shipments, receive goods, and track inbound deliveries
          into the warehouse.
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
          Inbound data will appear here.
        </Typography>
      </Paper>
    </Box>
  );
}
