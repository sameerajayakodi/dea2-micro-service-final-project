"use client";

import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import { getAllReceipts } from "@/services/inbound_service/inboundApi";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    getAllReceipts()
      .then((res) => setReceipts(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Warehouse Receipts (GRN)
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell>GRN Number</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ color: "#6366f1", fontWeight: 600 }}>
                    {r.receiptNumber || r.grnNumber}
                  </TableCell>
                  <TableCell>{r.supplierName}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}