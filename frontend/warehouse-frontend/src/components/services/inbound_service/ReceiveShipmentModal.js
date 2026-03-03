"use client";
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";
import { receiveGoods } from "@/services/inbound_service/inboundApi";

export default function ReceiveShipmentModal({ open, onClose, onRefresh }) {
  const [form, setForm] = useState({ supplierName: "", productName: "", sku: "", quantity: 1 });

  const handleSubmit = async () => {
    if (form.quantity <= 0) return alert("Quantity must be positive");
    try {
      await receiveGoods(form); // POST /api/v1/inbound/receive
      onRefresh();
      onClose();
    } catch (err) { console.error(err); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>Receive New Shipment</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Supplier Name" fullWidth onChange={(e) => setForm({...form, supplierName: e.target.value})} />
          <TextField label="Product Name" fullWidth onChange={(e) => setForm({...form, productName: e.target.value})} />
          <TextField label="SKU" fullWidth onChange={(e) => setForm({...form, sku: e.target.value})} />
          <TextField label="Quantity" type="number" fullWidth inputProps={{ min: 1 }} 
            onChange={(e) => setForm({...form, quantity: parseInt(e.target.value)})} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#6366f1" }}>Create Receipt</Button>
      </DialogActions>
    </Dialog>
  );
}