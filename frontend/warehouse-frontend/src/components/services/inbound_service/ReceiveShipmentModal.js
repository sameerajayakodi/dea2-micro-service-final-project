"use client";
import React, { useEffect, useState } from "react";
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

  const [form, setForm] = useState({
    supplierName: "",
    productName: "",
    sku: "",
    quantity: 1,
  });

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [sups, prods] = await Promise.all([
          getAvailableSuppliers(),
          getAvailableProducts(),
        ]);

        setSuppliers((sups || []).sort((a, b) => (a.name || "").localeCompare(b.name || "")));
        setProducts((prods || []).sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      } catch (e) {
        setError("Failed to load suppliers/products");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open]);

  const handleSubmit = async () => {
    if (!form.supplierName || !form.productName) {
      setError("Please select both supplier and product.");
      return;
    }
    if (!form.sku) {
      setError("SKU not filled. Select a product again.");
      return;
    }
    if (!form.quantity || form.quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    try {
      setError("");
      await receiveGoods({
        supplierName: form.supplierName,
        productName: form.productName,
        sku: form.sku,
        quantity: Number(form.quantity),
      });

      onRefresh?.();
      onClose?.();
      setForm({ supplierName: "", productName: "", sku: "", quantity: 1 });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create inbound receipt (API error).");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>Receive New Shipment</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Autocomplete
              options={suppliers}
              getOptionLabel={(o) => o?.name || ""}
              value={suppliers.find((s) => s.name === form.supplierName) || null}
              onChange={(e, v) => setForm((p) => ({ ...p, supplierName: v?.name || "" }))}
              renderInput={(params) => <TextField {...params} label="Select Supplier" />}
            />

            <Autocomplete
              options={products}
              getOptionLabel={(o) => o?.name || ""}
              value={products.find((p) => p.name === form.productName) || null}
              onChange={(e, v) =>
                setForm((p) => ({
                  ...p,
                  productName: v?.name || "",
                  sku: v?.skuCode || "",
                }))
              }
              renderInput={(params) => <TextField {...params} label="Select Product" />}
            />

            <TextField label="SKU (Auto-filled)" value={form.sku} disabled />

            <TextField
              label="Quantity"
              type="number"
              inputProps={{ min: 1 }}
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) || 1 }))}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Create Receipt</Button>
      </DialogActions>
    </Dialog>
  );
}