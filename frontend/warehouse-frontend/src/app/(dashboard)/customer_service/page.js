"use client";

import PeopleIcon from "@mui/icons-material/People";
import { Box, Paper, Typography } from "@mui/material";

export default function CustomerServicePage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <PeopleIcon sx={{ fontSize: 32, color: "#6366f1" }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Customer Service
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Manage customer records, view customer details, and handle
          customer-related operations across the warehouse system.
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
          Customer data will appear here.
        </Typography>
      </Paper>
    </Box>
  );
}
