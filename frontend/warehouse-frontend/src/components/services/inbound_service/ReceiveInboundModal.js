"use client";
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Alert } from "@mui/material";
import { receiveGoods } from "@/services/inbound_service/inboundApi";

export default function ReceiveInboundModal({ open, onClose, onRefresh }) {
  const [form, setForm] = useState({ supplierName: "", productName: "", sku: "", quantity: 1 });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // 1. Logic Validation: Block zero or negative numbers before calling the API
    if (form.quantity <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    try {
      await receiveGoods(form); // Calls POST /api/v1/inbound/receive
      setError("");
      onRefresh();
      onClose();
    } catch (err) { 
      console.error("Create failed:", err); 
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>New Inbound Receipt</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <TextField label="Supplier Name" fullWidth 
            onChange={(e) => setForm({...form, supplierName: e.target.value})} />
          <TextField label="Product Name" fullWidth 
            onChange={(e) => setForm({...form, productName: e.target.value})} />
          <TextField label="SKU" fullWidth 
            onChange={(e) => setForm({...form, sku: e.target.value})} />
          
          {/* 2. HTML Validation: inputProps min="1" prevents using the arrows to go below 1 */}
          <TextField 
            label="Quantity" 
            type="number" 
            fullWidth 
            inputProps={{ min: "1" }} 
            value={form.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setForm({...form, quantity: isNaN(val) ? "" : val});
              if (val > 0) setError(""); 
            }} 
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#6366f1" }}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}