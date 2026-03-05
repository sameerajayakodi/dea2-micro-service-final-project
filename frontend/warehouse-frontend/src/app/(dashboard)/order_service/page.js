"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";
import { getAllOrders, createOrder, getProducts, getCustomers } from "@/services/orders/ordersApi";

/* ── Status → Chip color mapping ─────────────────────────────── */
const STATUS_MAP = {
  CREATED:           { color: "info",      label: "Created" },
  VALIDATED:         { color: "warning",   label: "Validated" },
  APPROVED:          { color: "success",   label: "Approved" },
  REJECTED:          { color: "error",     label: "Rejected" },
  CANCELLED:         { color: "default",   label: "Cancelled" },
  PICKING_REQUESTED: { color: "secondary", label: "Picking Requested" },
};

const getStatusChipProps = (status) => {
  const upper = (status ?? "").toUpperCase();
  return STATUS_MAP[upper] ?? { color: "default", label: status ?? "Unknown" };
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function OrderServicePage() {
  const router = useRouter();

  // ── Table state ──
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Create‑wizard state ──
  const [wizardOpen, setWizardOpen]         = useState(false);
  const [customerId, setCustomerId]         = useState("");
  const [partialAllowed, setPartialAllowed] = useState(false);
  const [items, setItems] = useState([{ itemId: "", quantity: 1, unitPrice: 0 }]);
  const [products, setProducts]             = useState([]);
  const [customers, setCustomers]           = useState([]);
  const [submitting, setSubmitting]         = useState(false);

  // ── Toast state ──
  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });

  // ── Fetch orders ──
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, cRes, pRes] = await Promise.allSettled([
        getAllOrders(),
        getCustomers(),
        getProducts()
      ]);
      const oData = oRes.status === "fulfilled" ? oRes.value.data : [];
      const rows = Array.isArray(oData) ? oData : Array.isArray(oData?.content) ? oData.content : [];
      setOrders(rows);

      if (cRes.status === "fulfilled") {
        const cData = cRes.value.data;
        const cRows = Array.isArray(cData) ? cData : Array.isArray(cData?.content) ? cData.content : [];
        setCustomers(cRows);
      }

      if (pRes.status === "fulfilled") {
        const pData = pRes.value.data;
        const pRows = Array.isArray(pData) ? pData : Array.isArray(pData?.content) ? pData.content : [];
        setProducts(pRows);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setToast({ open: true, severity: "error", msg: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Item helpers ──
  const handleAddItem    = () => setItems(prev => [...prev, { itemId: "", quantity: 1, unitPrice: 0 }]);
  const handleRemoveItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const handleItemChange = (idx, field, value) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      
      // If we selected a product, try to auto-fill its price if available
      if (field === "itemId") {
        const selectedProd = products.find((p) => String(p.id) === String(value));
        if (selectedProd && selectedProd.price !== undefined) {
           copy[idx].unitPrice = selectedProd.price;
        }
      }
      
      return copy;
    });
  };

  const handleOpenWizard = async () => {
    setWizardOpen(true);
    try {
      const [{ data: pData }, { data: cData }] = await Promise.all([
        getProducts(),
        getCustomers()
      ]);
      const pRows = Array.isArray(pData) ? pData : Array.isArray(pData?.content) ? pData.content : [];
      const cRows = Array.isArray(cData) ? cData : Array.isArray(cData?.content) ? cData.content : [];
      setProducts(pRows);
      setCustomers(cRows);
    } catch (err) {
      console.error("Failed to fetch wizard data:", err);
      setToast({ open: true, severity: "warning", msg: "Could not load products or customers list" });
    }
  };

  // ── Submit order ──
  const handleCreateOrder = async () => {
    if (!customerId.trim()) {
      setToast({ open: true, severity: "warning", msg: "Customer ID is required" });
      return;
    }
    const validItems = items
      .filter(i => i.itemId && Number(i.quantity) > 0)
      .map(i => ({ itemId: i.itemId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }));

    if (validItems.length === 0) {
      setToast({ open: true, severity: "warning", msg: "Add at least one valid item" });
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({ customerId, partialAllowed, items: validItems });
      setToast({ open: true, severity: "success", msg: "Order created successfully!" });
      resetWizard();
      fetchOrders();
    } catch (err) {
      console.error("Create order failed:", err);
      setToast({ open: true, severity: "error", msg: "Failed to create order" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setWizardOpen(false);
    setCustomerId("");
    setPartialAllowed(false);
    setItems([{ itemId: "", quantity: 1, unitPrice: 0 }]);
  };

  // ── DataGrid columns ──
  const columns = [
    {
      field: "orderNumber",
      headerName: "Order #",
      flex: 0.8,
      minWidth: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          onClick={() => router.push(`/order_service/${params.row.id}`)}
          sx={{
            cursor: "pointer",
            color: "#6366f1",
            fontFamily: "monospace",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline", color: "#4f46e5" },
          }}
        >
          {params.value || String(params.row.id).substring(0, 12)}
        </Typography>
      ),
    },
    {
      field: "customerId",
      headerName: "Customer",
      flex: 0.9,
      minWidth: 160,
      renderCell: (params) => {
        const cId = params.value;
        const c = customers.find(x => String(x.customerId || x.id) === String(cId));
        const name = c ? (c.customerName || c.name || c.firstName) : null;
        return (
          <Box>
             <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 500 }}>
               {name || "Unknown"}
             </Typography>
             <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
               {cId}
             </Typography>
          </Box>
        );
      }
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 0.8,
      minWidth: 160,
      valueGetter: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "—"),
    },
    {
      field: "totalAmount",
      headerName: "Total ($)",
      flex: 0.5,
      minWidth: 110,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => `$${Number(value ?? 0).toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      minWidth: 160,
      renderCell: (params) => {
        const { color, label } = getStatusChipProps(params.value);
        return (
          <Chip
            label={label}
            color={color}
            size="small"
            sx={{ fontWeight: 600, letterSpacing: "0.3px" }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => router.push(`/order_service/${params.row.id}`)}
          sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  /* ─── RENDER ──────────────────────────────────────────────── */
  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ShoppingCartIcon sx={{ fontSize: 32, color: "#6366f1" }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Order Management
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchOrders}
              sx={{
                borderColor: "divider",
                color: "#64748b",
                textTransform: "none",
                "&:hover": { borderColor: "#6366f1", color: "#6366f1" },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenWizard}
              sx={{
                bgcolor: "#6366f1",
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              New Order
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Create, monitor, and manage warehouse orders. Track order status and fulfillment progress.
        </Typography>
      </Box>

      {/* ── DataGrid ── */}
      <Paper
        elevation={0}
        sx={{
          height: 560,
          width: "100%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          "& .MuiDataGrid-root":            { border: "none" },
          "& .MuiDataGrid-columnHeaders":   { bgcolor: "#f8fafc", color: "#64748b", fontWeight: 600 },
          "& .MuiDataGrid-columnSeparator": { color: "#e2e8f0" },
          "& .MuiDataGrid-cell":            { borderColor: "#f1f5f9" },
          "& .MuiDataGrid-row:hover":       { bgcolor: "#f8fafc" },
          "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #f1f5f9" },
        }}
      >
        <DataGrid
          rows={orders}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* ══════════════════════════════════════════════════════
          CREATE ORDER DIALOG
          ══════════════════════════════════════════════════════ */}
      <Dialog
        open={wizardOpen}
        onClose={resetWizard}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Create New Order
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {/* Customer + switch */}
            <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
              <Autocomplete
                options={customers}
                getOptionLabel={(c) => {
                  const nameStr = c.customerName || c.name || "";
                  const cId = c.customerId || c.id || "";
                  return nameStr ? `${nameStr} - ${c.phone || cId}` : `Customer ${cId}`;
                }}
                value={customers.find(c => String(c.customerId || c.id) === String(customerId)) || null}
                onChange={(_, newValue) => setCustomerId(newValue ? (newValue.customerId || newValue.id) : "")}
                isOptionEqualToValue={(option, value) => String(option.customerId || option.id) === String(value.customerId || value.id)}
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
                ListboxProps={{ style: { maxHeight: 300, overflow: "auto" } }}
                renderInput={(params) => <TextField {...params} label="Customer" placeholder="Select Customer" />}
                noOptionsText={customers.length === 0 ? "Loading or no customers..." : "No match"}
                renderOption={(props, option, { selected }) => {
                  const { key, ...otherProps } = props;
                  const nameStr = option.customerName || option.name || "";
                  const cId = option.customerId || option.id || "";
                  const statusLabel = option.status || "UNKNOWN";
                  const statusColor = statusLabel.toUpperCase() === "ACTIVE" ? "success" : "default";

                  return (
                    <MenuItem key={key} {...otherProps} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", py: 1, borderBottom: "1px solid #f1f5f9" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {nameStr || `Customer ${cId}`}
                        </Typography>
                        <Chip
                          label={statusLabel}
                          color={statusColor}
                          size="small"
                          sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {option.email || cId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                          {option.phone || ""}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={partialAllowed}
                    onChange={(e) => setPartialAllowed(e.target.checked)}
                    color="primary"
                  />
                }
                label="Partial Fulfillment"
                sx={{ color: "#64748b", whiteSpace: "nowrap" }}
              />
            </Box>

            {/* Section divider */}
            <SectionDivider text="Order Items" />

            {/* Item rows */}
            {items.map((item, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(p) => p.name ? `${p.name} - ${p.skuCode || ""}` : `Product ${p.id}`}
                  value={products.find(p => String(p.id) === String(item.itemId)) || null}
                  onChange={(_, newValue) => handleItemChange(idx, "itemId", newValue ? newValue.id : "")}
                  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                  size="small"
                  sx={{ flex: 2, minWidth: 250 }}
                  ListboxProps={{ style: { maxHeight: 300, overflow: "auto" } }}
                  renderInput={(params) => <TextField {...params} label="Product" />}
                  noOptionsText={products.length === 0 ? "Loading or no products..." : "No match"}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...otherProps } = props;
                    return (
                      <MenuItem key={key} {...otherProps} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", py: 1, borderBottom: "1px solid #f1f5f9" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                            {option.name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#10b981" }}>
                            ${Number(option.price || 0).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            SKU: {option.skuCode || "N/A"}
                          </Typography>
                          {option.category && (
                            <Chip size="small" label={option.category} sx={{ height: 16, fontSize: "0.6rem", bgcolor: "#f1f5f9", color: "#475569" }} />
                          )}
                        </Box>
                      </MenuItem>
                    );
                  }}
                />
                <TextField
                  label="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Unit Price"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <IconButton
                  onClick={() => handleRemoveItem(idx)}
                  disabled={items.length === 1}
                  sx={{ color: "#ef4444", "&.Mui-disabled": { color: "#cbd5e1" } }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              variant="text"
              sx={{ color: "#6366f1", width: "fit-content", textTransform: "none" }}
            >
              Add Another Item
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={resetWizard} sx={{ color: "#64748b", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#6366f1",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {submitting ? "Submitting…" : "Submit Order"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ── Tiny helper component ─────────────────────────────────── */
function SectionDivider({ text }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box sx={{ height: 1, flex: 1, bgcolor: "#e2e8f0" }} />
      <Typography
        variant="caption"
        sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}
      >
        {text}
      </Typography>
      <Box sx={{ height: 1, flex: 1, bgcolor: "#e2e8f0" }} />
    </Box>
  );
}
