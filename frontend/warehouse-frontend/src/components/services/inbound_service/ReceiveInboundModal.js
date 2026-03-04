"use client";
import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, Alert, Autocomplete, CircularProgress 
} from "@mui/material";
import { receiveGoods, getAvailableSuppliers, getAvailableProducts } from "@/services/inbound_service/inboundApi";

export default function ReceiveInboundModal({ open, onClose, onRefresh }) {
  const [form, setForm] = useState({ supplierName: "", productName: "", sku: "", quantity: 1 });
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load and sort data when the modal opens
  useEffect(() => {
    if (open) {
      const loadOptions = async () => {
        setLoading(true);
        try {
          const [supRes, prodRes] = await Promise.all([getAvailableSuppliers(), getAvailableProducts()]);
          
          // Sort alphabetically by name
          const sortedSups = (supRes.data || []).sort((a, b) => a.supplierName.localeCompare(b.supplierName));
          const sortedProds = (prodRes.data || []).sort((a, b) => a.productName.localeCompare(b.productName));
          
          setSuppliers(sortedSups);
          setProducts(sortedProds);
        } catch (err) {
          console.error("Failed to load options", err);
        } finally {
          setLoading(false);
        }
      };
      loadOptions();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!form.supplierName || !form.productName) {
      setError("Please select both a supplier and a product.");
      return;
    }
    if (form.quantity <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    try {
      await receiveGoods(form);
      setError("");
      onRefresh();
      onClose();
      setForm({ supplierName: "", productName: "", sku: "", quantity: 1 });
    } catch (err) { 
      console.error("Create failed:", err); 
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>New Inbound Receipt</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            {/* Searchable Supplier Dropdown */}
            <Autocomplete
              options={suppliers}
              getOptionLabel={(option) => option.supplierName || ""}
              onChange={(e, newValue) => {
                setForm({ ...form, supplierName: newValue?.supplierName || "" });
                if (newValue) setError("");
              }}
              renderInput={(params) => <TextField {...params} label="Select Supplier" fullWidth />}
            />

            {/* Searchable Product Dropdown */}
            <Autocomplete
              options={products}
              getOptionLabel={(option) => option.productName || ""}
              onChange={(e, newValue) => {
                setForm({ ...form, productName: newValue?.productName || "", sku: newValue?.sku || "" });
                if (newValue) setError("");
              }}
              renderInput={(params) => <TextField {...params} label="Select Product" fullWidth />}
            />

            <TextField label="SKU" fullWidth value={form.sku} InputProps={{ readOnly: true }} disabled />
            
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
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: "#64748b" }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#6366f1" }}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}