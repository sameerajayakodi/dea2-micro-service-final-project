"use client";
import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, Autocomplete, CircularProgress, Alert 
} from "@mui/material";
import { receiveGoods, getAvailableSuppliers, getAvailableProducts } from "@/services/inbound_service/inboundApi";

export default function ReceiveShipmentModal({ open, onClose, onRefresh }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ supplierName: "", productName: "", sku: "", quantity: 1 });

  useEffect(() => {
    if (open) {
      const loadOptions = async () => {
        setLoading(true);
        try {
          const [supRes, prodRes] = await Promise.all([getAvailableSuppliers(), getAvailableProducts()]);
          // Alphabetical sorting of external microservice data
          const sortedSups = (supRes.data || []).sort((a, b) => a.supplierName.localeCompare(b.supplierName));
          const sortedProds = (prodRes.data || []).sort((a, b) => a.productName.localeCompare(b.productName));
          setSuppliers(sortedSups);
          setProducts(sortedProds);
        } catch (err) {
          setError("Failed to link with Supplier or Product services.");
        } finally {
          setLoading(false);
        }
      };
      loadOptions();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (form.quantity <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    try {
      await receiveGoods(form); // POST /api/v1/inbound/receive
      onRefresh();
      onClose();
      setForm({ supplierName: "", productName: "", sku: "", quantity: 1 });
    } catch (err) { 
      setError("Communication with remote service failed."); 
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 3 }}>Receive New Shipment</DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            
            <Autocomplete
              options={suppliers}
              getOptionLabel={(option) => option.supplierName || ""}
              onChange={(e, val) => setForm({ ...form, supplierName: val?.supplierName || "" })}
              renderInput={(params) => <TextField {...params} label="Select Supplier" fullWidth />}
            />

            <Autocomplete
              options={products}
              getOptionLabel={(option) => option.productName || ""}
              onChange={(e, val) => setForm({ ...form, productName: val?.productName || "", sku: val?.sku || "" })}
              renderInput={(params) => <TextField {...params} label="Select Product" fullWidth />}
            />

            <TextField label="SKU" fullWidth value={form.sku} InputProps={{ readOnly: true }} disabled variant="filled" />
            
            <TextField 
              label="Quantity" 
              type="number" 
              fullWidth 
              inputProps={{ min: 1 }} 
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} 
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: "#64748b", textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#6366f1", borderRadius: 2 }}>
          Create Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
}