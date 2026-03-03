"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import TuneIcon from "@mui/icons-material/Tune";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
import {
  EmptyState,
  LoadingState,
  Toast,
} from "@/components/workforce/shared";
import {
  createInventoryAdjustment,
  getAllAdjustments,
  getAllInventories,
  getExpiringSoon,
  getLowStockAlerts,
  markAsDamaged,
  releaseReservedStock,
  reserveStock,
  updateStockOnPicking,
  updateStockOnReceiving,
} from "@/services/inventory";

const adjustmentTypes = [
  "INCREASE",
  "DECREASE",
  "DAMAGE",
  "LOSS",
  "CORRECTION",
  "RETURN",
];

const stockOps = [
  { value: "receiving", label: "Receiving" },
  { value: "picking", label: "Picking" },
  { value: "reserve", label: "Reserve" },
  { value: "release", label: "Release Reserved" },
  { value: "damaged", label: "Mark Damaged" },
];

const initialAdjustment = {
  inventoryId: "",
  adjustmentType: "",
  quantityChange: "",
  reason: "",
  adjustedBy: "",
};

const initialStockOp = {
  operation: "receiving",
  inventoryId: "",
  quantity: "",
  reason: "",
};

function AdjustmentFormDialog({
  open,
  loading,
  inventories,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(initialAdjustment);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!form.inventoryId) nextErrors.inventoryId = "Inventory is required";
    if (!form.adjustmentType) nextErrors.adjustmentType = "Adjustment type is required";
    if (!form.quantityChange) {
      nextErrors.quantityChange = "Quantity change is required";
    }
    if (!form.reason.trim()) nextErrors.reason = "Reason is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      inventoryId: Number(form.inventoryId),
      adjustmentType: form.adjustmentType,
      quantityChange: Number(form.quantityChange),
      reason: form.reason.trim(),
      adjustedBy: form.adjustedBy.trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Create Adjustment</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Inventory"
                value={form.inventoryId}
                onChange={(e) => setForm({ ...form, inventoryId: e.target.value })}
                error={!!errors.inventoryId}
                helperText={errors.inventoryId}
              >
                {inventories.map((row) => (
                  <MenuItem key={row.inventoryId} value={row.inventoryId}>
                    {`#${row.inventoryId} - ${row.batchNo} (${row.productName})`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Adjustment Type"
                value={form.adjustmentType}
                onChange={(e) => setForm({ ...form, adjustmentType: e.target.value })}
                error={!!errors.adjustmentType}
                helperText={errors.adjustmentType}
              >
                {adjustmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Quantity Change"
                value={form.quantityChange}
                onChange={(e) => setForm({ ...form, quantityChange: e.target.value })}
                error={!!errors.quantityChange}
                helperText={errors.quantityChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                error={!!errors.reason}
                helperText={errors.reason}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Adjusted By"
                value={form.adjustedBy}
                onChange={(e) => setForm({ ...form, adjustedBy: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "#64748b" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StockOperationDialog({
  open,
  loading,
  inventories,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(initialStockOp);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!form.inventoryId) nextErrors.inventoryId = "Inventory is required";
    if (!form.quantity || Number(form.quantity) <= 0) {
      nextErrors.quantity = "Quantity must be greater than 0";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      operation: form.operation,
      inventoryId: Number(form.inventoryId),
      quantity: Number(form.quantity),
      reason: form.reason.trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Run Stock Operation</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Operation"
                value={form.operation}
                onChange={(e) => setForm({ ...form, operation: e.target.value })}
              >
                {stockOps.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Inventory"
                value={form.inventoryId}
                onChange={(e) => setForm({ ...form, inventoryId: e.target.value })}
                error={!!errors.inventoryId}
                helperText={errors.inventoryId}
              >
                {inventories.map((row) => (
                  <MenuItem key={row.inventoryId} value={row.inventoryId}>
                    {`#${row.inventoryId} - ${row.batchNo} (${row.productName})`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                error={!!errors.quantity}
                helperText={errors.quantity}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "#64748b" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
        >
          Execute
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function InventoryAdjustmentsPage() {
  const [inventories, setInventories] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const lowStockCount = useMemo(() => lowStock.length, [lowStock]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [invRes, adjRes, lowAlertRes, expRes] = await Promise.all([
        getAllInventories(),
        getAllAdjustments(),
        getLowStockAlerts(),
        getExpiringSoon(30),
      ]);

      setInventories(invRes.data);
      setAdjustments(adjRes.data);
      setLowStock(lowAlertRes.data?.lowStockItems || []);
      setExpiring(expRes.data);
    } catch {
      setToast({
        open: true,
        message: "Failed to load adjustment and stock data",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdjustmentSubmit = async (payload) => {
    try {
      setSaving(true);
      await createInventoryAdjustment(payload);
      setAdjustmentDialogOpen(false);
      setToast({
        open: true,
        message: "Adjustment created successfully",
        severity: "success",
      });
      fetchData(true);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create adjustment";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleStockSubmit = async (payload) => {
    const request = {
      inventoryId: payload.inventoryId,
      quantity: payload.quantity,
      reason: payload.reason,
    };

    try {
      setSaving(true);
      if (payload.operation === "receiving") await updateStockOnReceiving(request);
      if (payload.operation === "picking") await updateStockOnPicking(request);
      if (payload.operation === "reserve") await reserveStock(request);
      if (payload.operation === "release") await releaseReservedStock(request);
      if (payload.operation === "damaged") await markAsDamaged(request);

      setStockDialogOpen(false);
      setToast({
        open: true,
        message: "Stock operation completed",
        severity: "success",
      });
      fetchData(true);
    } catch (err) {
      const message = err.response?.data?.message || "Stock operation failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { id: "adjustmentId", label: "ID", sortable: true },
    {
      id: "adjustmentType",
      label: "Type",
      sortable: true,
      render: (row) => (
        <Chip
          label={row.adjustmentType?.replace(/_/g, " ")}
          size="small"
          sx={{ bgcolor: "#ede9fe", color: "#5b21b6", fontWeight: 600 }}
        />
      ),
    },
    { id: "inventoryId", label: "Inventory", sortable: true },
    { id: "batchNo", label: "Batch", sortable: true },
    { id: "productName", label: "Product", sortable: true },
    { id: "quantityChange", label: "Qty Change", sortable: true },
    { id: "reason", label: "Reason", sortable: false },
    { id: "adjustedBy", label: "Adjusted By", sortable: true },
    {
      id: "createdAt",
      label: "Created At",
      sortable: true,
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"),
    },
  ];

  if (loading) return <LoadingState message="Loading adjustments..." />;

  return (
    <Box>
      <PageHeader
        title="Adjustments & Stock Ops"
        subtitle="Create inventory adjustments and execute stock operations with audit visibility."
        icon={<TuneIcon sx={{ fontSize: 32 }} />}
        backHref="/inventory_service"
        count={adjustments.length}
        action={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<SettingsBackupRestoreIcon />}
              onClick={() => setStockDialogOpen(true)}
              sx={{ borderColor: "#cbd5e1", color: "#475569" }}
            >
              Stock Operation
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAdjustmentDialogOpen(true)}
              sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
            >
              New Adjustment
            </Button>
          </Box>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
              Low Stock Items
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#ef4444" }}>
              {lowStockCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
              Expiring in 30 Days
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#f59e0b" }}>
              {expiring.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
              Adjustments Recorded
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#6366f1" }}>
              {adjustments.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        rows={adjustments}
        searchKeys={[
          "adjustmentType",
          "batchNo",
          "productName",
          "reason",
          "adjustedBy",
        ]}
        emptyComponent={
          <EmptyState icon={<WarningAmberIcon />} message="No adjustments found." />
        }
      />

      <AdjustmentFormDialog
        key={`adjustment-${adjustmentDialogOpen ? "open" : "closed"}`}
        open={adjustmentDialogOpen}
        inventories={inventories}
        loading={saving}
        onClose={() => setAdjustmentDialogOpen(false)}
        onSubmit={handleAdjustmentSubmit}
      />

      <StockOperationDialog
        key={`stock-${stockDialogOpen ? "open" : "closed"}`}
        open={stockDialogOpen}
        inventories={inventories}
        loading={saving}
        onClose={() => setStockDialogOpen(false)}
        onSubmit={handleStockSubmit}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />

      {refreshing && (
        <Box sx={{ position: "fixed", right: 24, bottom: 24 }}>
          <Chip
            icon={<CircularProgress size={14} sx={{ color: "#6366f1 !important" }} />}
            label="Refreshing..."
            sx={{ bgcolor: "#eef2ff", color: "#4338ca", fontWeight: 500 }}
          />
        </Box>
      )}
    </Box>
  );
}
