"use client";

import React, { useEffect, useState } from "react";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

import {
  getInboundShipments,
  getAllReceipts,
  getAllReceiptItems,
  updateShipmentStatus,
} from "@/services/inbound_service/inboundApi";

import ReceiveShipmentModal from "@/components/services/inbound_service/ReceiveShipmentModal";

export default function InboundServicePage() {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      let res;
      if (tabValue === 0) res = await getInboundShipments();
      else if (tabValue === 1) res = await getAllReceipts();
      else res = await getAllReceiptItems();

      setData(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === "PENDING" ? "RECEIVED" : "COMPLETED";
    try {
      await updateShipmentStatus(id, nextStatus);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <MoveToInboxIcon sx={{ fontSize: 32, color: "#6366f1" }} />
          <Typography variant="h4" fontWeight={700}>
            Inbound Service
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ bgcolor: "#6366f1", borderRadius: 2 }}
        >
          New Inbound
        </Button>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        sx={{ mb: 3, "& .MuiTabs-indicator": { bgcolor: "#6366f1" } }}
      >
        <Tab label="Shipments" />
        <Tab label="Receipts (GRNs)" />
        <Tab label="Receipt Items" />
      </Tabs>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                {tabValue === 0 && (
                  <>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </>
                )}
                {tabValue === 1 && (
                  <>
                    <TableCell>GRN Number</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </>
                )}
                {tabValue === 2 && (
                  <>
                    <TableCell>Item ID</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Qty Received</TableCell>
                    <TableCell>Quality</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} hover>
                  {tabValue === 0 && (
                    <>
                      <TableCell>{row.supplierName}</TableCell>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell>
                        <Chip label={row.status} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleStatusChange(row.id, row.status)}>
                          Update
                        </Button>
                      </TableCell>
                    </>
                  )}

                  {tabValue === 1 && (
                    <>
                      <TableCell sx={{ color: "#6366f1", fontWeight: 600 }}>
                        {row.grnNumber || row.receiptNumber}
                      </TableCell>
                      <TableCell>
                        {new Date(row.receiptDate || row.receivedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={row.status} color="success" size="small" />
                      </TableCell>
                    </>
                  )}

                  {tabValue === 2 && (
                    <>
                      <TableCell>#{row.id}</TableCell>
                      <TableCell>{row.productName || `ID: ${row.productId}`}</TableCell>
                      <TableCell>{row.quantityReceived}</TableCell>
                      <TableCell>
                        <Chip label={row.qualityStatus || row.condition || "PENDING"} size="small" variant="outlined" />
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ReceiveShipmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchData}
      />
    </Box>
  );
}