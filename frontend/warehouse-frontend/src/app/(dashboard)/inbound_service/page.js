"use client";
import React, { useState, useEffect } from "react";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import AddIcon from "@mui/icons-material/Add";
import { 
  Box, Typography, Button, Paper, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow 
} from "@mui/material";
import { getInboundShipments, getAllReceipts, getAllReceiptItems } from "@/services/inbound_service/inboundApi";
import ReceiveShipmentModal from "@/components/services/inbound_service/ReceiveShipmentModal";

export default function InboundServicePage() {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      let res;
      if (tabValue === 0) res = await getInboundShipments(); // GET /shipments
      else if (tabValue === 1) res = await getAllReceipts();   // GET /receipts
      else res = await getAllReceiptItems();                   // GET /receipt-items
      setData(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [tabValue]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <MoveToInboxIcon sx={{ fontSize: 32, color: "#6366f1" }} />
          <Typography variant="h4" fontWeight={700}>Inbound Service</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)} sx={{ bgcolor: "#6366f1" }}>
          New Inbound
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mb: 3 }}>
        <Tab label="Shipments" />
        <Tab label="Receipts (GRNs)" />
        <Tab label="Items" />
      </Tabs>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                {tabValue === 0 && <><TableCell>Supplier</TableCell><TableCell>Product</TableCell><TableCell>Status</TableCell></>}
                {tabValue === 1 && <><TableCell>GRN Number</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell></>}
                {tabValue === 2 && <><TableCell>Item ID</TableCell><TableCell>Qty</TableCell><TableCell>Quality</TableCell></>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} hover>
                  {tabValue === 0 && <><TableCell>{row.supplierName}</TableCell><TableCell>{row.productName}</TableCell><TableCell>{row.status}</TableCell></>}
                  {tabValue === 1 && <><TableCell sx={{fontWeight: 600, color: "#6366f1"}}>{row.grnNumber}</TableCell><TableCell>{row.receiptDate}</TableCell><TableCell>{row.status}</TableCell></>}
                  {tabValue === 2 && <><TableCell>#{row.id}</TableCell><TableCell>{row.quantityReceived}</TableCell><TableCell>{row.qualityStatus}</TableCell></>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ReceiveShipmentModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />
    </Box>
  );
}