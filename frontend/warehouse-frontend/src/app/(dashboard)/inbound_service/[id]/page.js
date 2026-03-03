"use client";
import { useParams } from "next/navigation";
import { Box, Typography, Paper } from "@mui/material";

export default function ShipmentDetails() {
  const { id } = useParams(); // Retrieves the [id] from the URL

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Shipment Details: #{id}
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="textSecondary">
          Detailed view for GRN processing and quality checks.
        </Typography>
      </Paper>
    </Box>
  );
}