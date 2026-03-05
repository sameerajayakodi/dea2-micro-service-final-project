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
  Tab,
  Tabs,
  TextField,
  Typography,
  Snackbar,
  Alert,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import {
  getAllSuppliers,
  createSupplier,
  updateSupplierStatus,
  getAllPurchaseOrders,
  createPurchaseOrder,
} from "@/services/supplier_service/supplierApi";

/* ── Supplier Status → Chip color ─────────────────────────── */
const SUPPLIER_STATUS_MAP = {
  ACTIVE: { color: "success", label: "Active" },
  INACTIVE: { color: "default", label: "Inactive" },
};

/* ── PO Status → Chip color ───────────────────────────────── */
const PO_STATUS_MAP = {
  DRAFT: { color: "default", label: "Draft" },
  SUBMITTED: { color: "info", label: "Submitted" },
  APPROVED: { color: "warning", label: "Approved" },
  SENT: { color: "primary", label: "Sent" },
  RECEIVED: { color: "success", label: "Received" },
  CANCELLED: { color: "error", label: "Cancelled" },
};

const getSupplierChip = (status) => {
  const s = (status ?? "").toUpperCase();
  return SUPPLIER_STATUS_MAP[s] ?? { color: "default", label: status ?? "Unknown" };
};

const getPOChip = (status) => {
  const s = (status ?? "").toUpperCase();
  return PO_STATUS_MAP[s] ?? { color: "default", label: status ?? "Unknown" };
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function SupplierServicePage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  // ── Supplier state ──
  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(true);

  // ── PO state ──
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poLoading, setPOLoading] = useState(true);

  // ── Create Supplier dialog ──
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });
  const [supplierSubmitting, setSupplierSubmitting] = useState(false);

  // ── Create PO dialog ──
  const [poDialogOpen, setPODialogOpen] = useState(false);
  const [poForm, setPOForm] = useState({
    supplierId: "",
    expectedDeliveryDate: "",
  });
  const [poItems, setPOItems] = useState([{ productId: "", quantity: 1, unitPrice: 0 }]);
  const [poSubmitting, setPOSubmitting] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });
  const showToast = (severity, msg) => setToast({ open: true, severity, msg });

  /* ── Fetchers ──────────────────────────────────────────── */
  const fetchSuppliers = useCallback(async () => {
    setSupplierLoading(true);
    try {
      const { data } = await getAllSuppliers();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.suppliers) ? data.suppliers : Array.isArray(data?.content) ? data.content : [];
      setSuppliers(rows);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      showToast("error", "Failed to load suppliers");
    } finally {
      setSupplierLoading(false);
    }
  }, []);

  const fetchPurchaseOrders = useCallback(async () => {
    setPOLoading(true);
    try {
      const { data } = await getAllPurchaseOrders();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.purchaseOrders) ? data.purchaseOrders : Array.isArray(data?.content) ? data.content : [];
      setPurchaseOrders(rows);
    } catch (err) {
      console.error("Failed to fetch purchase orders:", err);
      showToast("error", "Failed to load purchase orders");
    } finally {
      setPOLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
    fetchPurchaseOrders();
  }, [fetchSuppliers, fetchPurchaseOrders]);

  /* ── Supplier form helpers ─────────────────────────────── */
  const handleSupplierFieldChange = (field, value) => {
    setSupplierForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSupplier = async () => {
    if (!supplierForm.name.trim()) {
      showToast("warning", "Supplier name is required");
      return;
    }
    if (!supplierForm.email.trim()) {
      showToast("warning", "Email is required");
      return;
    }
    setSupplierSubmitting(true);
    try {
      await createSupplier(supplierForm);
      showToast("success", "Supplier created successfully!");
      resetSupplierDialog();
      fetchSuppliers();
    } catch (err) {
      console.error("Create supplier failed:", err);
      showToast("error", "Failed to create supplier");
    } finally {
      setSupplierSubmitting(false);
    }
  };

  const resetSupplierDialog = () => {
    setSupplierDialogOpen(false);
    setSupplierForm({ name: "", contactPerson: "", email: "", phone: "", address: "" });
  };

  /* ── PO form helpers ───────────────────────────────────── */
  const handlePOItemChange = (idx, field, value) => {
    setPOItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleAddPOItem = () => setPOItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);
  const handleRemovePOItem = (idx) => setPOItems((prev) => prev.filter((_, i) => i !== idx));

  const handleCreatePO = async () => {
    if (!poForm.supplierId.trim()) {
      showToast("warning", "Supplier is required");
      return;
    }
    const validItems = poItems
      .filter((i) => i.productId && Number(i.quantity) > 0)
      .map((i) => ({ productId: i.productId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }));

    if (validItems.length === 0) {
      showToast("warning", "Add at least one valid item");
      return;
    }

    setPOSubmitting(true);
    try {
      await createPurchaseOrder({
        supplierId: poForm.supplierId,
        expectedDeliveryDate: poForm.expectedDeliveryDate
          ? new Date(poForm.expectedDeliveryDate).toISOString()
          : undefined,
        items: validItems,
      });
      showToast("success", "Purchase order created!");
      resetPODialog();
      fetchPurchaseOrders();
    } catch (err) {
      console.error("Create PO failed:", err);
      showToast("error", "Failed to create purchase order");
    } finally {
      setPOSubmitting(false);
    }
  };

  const resetPODialog = () => {
    setPODialogOpen(false);
    setPOForm({ supplierId: "", expectedDeliveryDate: "" });
    setPOItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
  };

  /* ── Toggle supplier status ────────────────────────────── */
  const handleToggleSupplierStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateSupplierStatus(id, { status: newStatus });
      showToast("success", `Supplier set to ${newStatus}`);
      fetchSuppliers();
    } catch (err) {
      console.error("Status update failed:", err);
      showToast("error", "Failed to update supplier status");
    }
  };

  /* ── Supplier DataGrid columns ─────────────────────────── */
  const supplierColumns = [
    {
      field: "name",
      headerName: "Supplier Name",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          onClick={() => router.push(`/supplier_service/${params.row.id}`)}
          sx={{
            cursor: "pointer",
            color: "#6366f1",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline", color: "#4f46e5" },
          }}
        >
          {params.value || "—"}
        </Typography>
      ),
    },
    { field: "contactPerson", headerName: "Contact Person", flex: 0.8, minWidth: 140 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "phone", headerName: "Phone", flex: 0.6, minWidth: 130 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      minWidth: 120,
      renderCell: (params) => {
        const { color, label } = getSupplierChip(params.value);
        return (
          <Chip
            label={label}
            color={color}
            size="small"
            sx={{ fontWeight: 600, letterSpacing: "0.3px", cursor: "pointer" }}
            onClick={() => handleToggleSupplierStatus(params.row.id, params.value)}
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
          onClick={() => router.push(`/supplier_service/${params.row.id}`)}
          sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  /* ── PO DataGrid columns ───────────────────────────────── */
  const poColumns = [
    {
      field: "poNumber",
      headerName: "PO #",
      flex: 0.8,
      minWidth: 160,
      renderCell: (params) => (
        <Typography
          variant="body2"
          onClick={() => router.push(`/supplier_service/purchase-orders/${params.row.id}`)}
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
      field: "supplierId",
      headerName: "Supplier ID",
      flex: 0.7,
      minWidth: 140,
      valueGetter: (value) => value ? String(value).substring(0, 12) + "…" : "—",
    },
    {
      field: "expectedDeliveryDate",
      headerName: "Expected Delivery",
      flex: 0.8,
      minWidth: 160,
      valueGetter: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "—"),
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
      flex: 0.6,
      minWidth: 130,
      renderCell: (params) => {
        const { color, label } = getPOChip(params.value);
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
      field: "createdAt",
      headerName: "Created",
      flex: 0.7,
      minWidth: 150,
      valueGetter: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "—"),
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
          onClick={() => router.push(`/supplier_service/purchase-orders/${params.row.id}`)}
          sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  /* ─── RENDER ──────────────────────────────────────────── */
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
            <BusinessIcon sx={{ fontSize: 32, color: "#6366f1" }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Supplier Management
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => { fetchSuppliers(); fetchPurchaseOrders(); }}
              sx={{
                borderColor: "divider",
                color: "#64748b",
                textTransform: "none",
                "&:hover": { borderColor: "#6366f1", color: "#6366f1" },
              }}
            >
              Refresh
            </Button>
            {tab === 0 ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setSupplierDialogOpen(true)}
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
                New Supplier
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setPODialogOpen(true)}
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
                New Purchase Order
              </Button>
            )}
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Manage supplier relationships, track purchase orders, and handle procurement operations.
        </Typography>
      </Box>

      {/* ── Tabs ── */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": { bgcolor: "#6366f1" },
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
          "& .Mui-selected": { color: "#6366f1" },
        }}
      >
        <Tab icon={<BusinessIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Suppliers" />
        <Tab icon={<ShoppingCartCheckoutIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Purchase Orders" />
      </Tabs>

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
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc", color: "#64748b", fontWeight: 600 },
          "& .MuiDataGrid-columnSeparator": { color: "#e2e8f0" },
          "& .MuiDataGrid-cell": { borderColor: "#f1f5f9" },
          "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
          "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #f1f5f9" },
        }}
      >
        {tab === 0 ? (
          <DataGrid
            rows={suppliers}
            columns={supplierColumns}
            loading={supplierLoading}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
          />
        ) : (
          <DataGrid
            rows={purchaseOrders}
            columns={poColumns}
            loading={poLoading}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
            }}
            disableRowSelectionOnClick
          />
        )}
      </Paper>

      {/* ══════════════════════════════════════════════════════
          CREATE SUPPLIER DIALOG
          ══════════════════════════════════════════════════════ */}
      <Dialog
        open={supplierDialogOpen}
        onClose={resetSupplierDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Create New Supplier
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
            <TextField
              label="Supplier Name"
              value={supplierForm.name}
              onChange={(e) => handleSupplierFieldChange("name", e.target.value)}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="Contact Person"
              value={supplierForm.contactPerson}
              onChange={(e) => handleSupplierFieldChange("contactPerson", e.target.value)}
              size="small"
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={supplierForm.email}
                onChange={(e) => handleSupplierFieldChange("email", e.target.value)}
                size="small"
                fullWidth
                required
              />
              <TextField
                label="Phone"
                value={supplierForm.phone}
                onChange={(e) => handleSupplierFieldChange("phone", e.target.value)}
                size="small"
                fullWidth
              />
            </Box>
            <TextField
              label="Address"
              value={supplierForm.address}
              onChange={(e) => handleSupplierFieldChange("address", e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={resetSupplierDialog} sx={{ color: "#64748b", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSupplier}
            variant="contained"
            disabled={supplierSubmitting}
            sx={{
              bgcolor: "#6366f1",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {supplierSubmitting ? "Creating…" : "Create Supplier"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════
          CREATE PURCHASE ORDER DIALOG
          ══════════════════════════════════════════════════════ */}
      <Dialog
        open={poDialogOpen}
        onClose={resetPODialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Create Purchase Order
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Autocomplete
                options={suppliers}
                getOptionLabel={(s) => s.name ? `${s.name} (${s.contactPerson || "N/A"})` : `Supplier ${s.id}`}
                value={suppliers.find((s) => String(s.id) === String(poForm.supplierId)) || null}
                onChange={(_, newValue) => setPOForm((prev) => ({ ...prev, supplierId: newValue ? newValue.id : "" }))}
                isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                size="small"
                sx={{ flex: 2, minWidth: 250 }}
                renderInput={(params) => <TextField {...params} label="Supplier" required />}
                noOptionsText={suppliers.length === 0 ? "Loading or no suppliers…" : "No match"}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <MenuItem key={key} {...otherProps} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", py: 1, borderBottom: "1px solid #f1f5f9" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {option.contactPerson || "—"} · {option.email || "—"}
                      </Typography>
                    </MenuItem>
                  );
                }}
              />
              <TextField
                label="Expected Delivery Date"
                type="date"
                value={poForm.expectedDeliveryDate}
                onChange={(e) => setPOForm((prev) => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                size="small"
                sx={{ flex: 1, minWidth: 180 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            {/* Section divider */}
            <SectionDivider text="Order Items" />

            {/* Item rows */}
            {poItems.map((item, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                  label="Product ID"
                  value={item.productId}
                  onChange={(e) => handlePOItemChange(idx, "productId", e.target.value)}
                  size="small"
                  sx={{ flex: 2, minWidth: 200 }}
                />
                <TextField
                  label="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handlePOItemChange(idx, "quantity", e.target.value)}
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Unit Price"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handlePOItemChange(idx, "unitPrice", e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <IconButton
                  onClick={() => handleRemovePOItem(idx)}
                  disabled={poItems.length === 1}
                  sx={{ color: "#ef4444", "&.Mui-disabled": { color: "#cbd5e1" } }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddPOItem}
              variant="text"
              sx={{ color: "#6366f1", width: "fit-content", textTransform: "none" }}
            >
              Add Another Item
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={resetPODialog} sx={{ color: "#64748b", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePO}
            variant="contained"
            disabled={poSubmitting}
            sx={{
              bgcolor: "#6366f1",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {poSubmitting ? "Creating…" : "Create Purchase Order"}
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
