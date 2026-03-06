"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { getShipmentById } from "@/services/inbound_service/inboundApi";

export default function ShipmentDetails() {
  const params = useParams();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getShipmentById(id)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Shipment Details: #{id}
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : !data ? (
          <Typography color="textSecondary">No data found.</Typography>
        ) : (
          <>
            <Typography><b>Supplier:</b> {data.supplierName}</Typography>
            <Typography><b>Product:</b> {data.productName}</Typography>
            <Typography><b>Quantity:</b> {data.quantity}</Typography>
            <Typography><b>Status:</b> {data.status}</Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}