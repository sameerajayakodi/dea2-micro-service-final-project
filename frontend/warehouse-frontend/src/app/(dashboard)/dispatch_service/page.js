"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
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
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";

import {
  getAllDispatches,
  createDispatch,
  deleteDispatch,
} from "@/services/dispatches/dispatchesApi";

/* ── Status → Chip color mapping ─────────────────────────────── */
const STATUS_MAP = {
  PENDING: { color: "warning", label: "Pending" },
  IN_TRANSIT: { color: "info", label: "In Transit" },
  DELIVERED: { color: "success", label: "Delivered" },
  CANCELLED: { color: "default", label: "Cancelled" },
};

const getStatusChipProps = (status) => {
  const upper = (status ?? "").toUpperCase();
  return STATUS_MAP[upper] ?? { color: "default", label: status ?? "Unknown" };
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function DispatchServicePage() {
  const router = useRouter();

  // ── Table state ──
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Create-wizard state ──
  const [wizardOpen, setWizardOpen] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    vehicleId: "",
    driverId: "",
    status: "PENDING",
    routeDetails: "",
    deliveryNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Delete confirmation state ──
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dispatchToDelete, setDispatchToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Toast state ──
  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });

  // ── Fetch dispatches ──
  const fetchDispatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllDispatches();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setDispatches(rows);
    } catch (err) {
      console.error("Failed to fetch dispatches:", err);
      setToast({ open: true, severity: "error", msg: "Failed to load dispatches" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  // ── Handle Form Changes ──
  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // ── Submit dispatch ──
  const handleCreateDispatch = async () => {
    if (!formData.orderId.trim() || !formData.vehicleId.trim() || !formData.driverId.trim()) {
      setToast({ open: true, severity: "warning", msg: "Order ID, Vehicle ID, and Driver ID are required" });
      return;
    }

    setSubmitting(true);
    try {
      await createDispatch(formData);
      setToast({ open: true, severity: "success", msg: "Dispatch created successfully!" });
      resetWizard();
      fetchDispatches();
    } catch (err) {
      console.error("Create dispatch failed:", err);
      setToast({ open: true, severity: "error", msg: "Failed to create dispatch" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setWizardOpen(false);
    setFormData({
      orderId: "",
      vehicleId: "",
      driverId: "",
      status: "PENDING",
      routeDetails: "",
      deliveryNotes: "",
    });
  };

  // ── Delete dispatch ──
  const confirmDelete = (id) => {
    setDispatchToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDispatch = async () => {
    if (!dispatchToDelete) return;
    setDeleting(true);
    try {
      await deleteDispatch(dispatchToDelete);
      setToast({ open: true, severity: "success", msg: "Dispatch deleted successfully!" });
      setDeleteDialogOpen(false);
      setDispatchToDelete(null);
      fetchDispatches();
    } catch (err) {
      console.error("Delete dispatch failed:", err);
      setToast({ open: true, severity: "error", msg: "Failed to delete dispatch" });
    } finally {
      setDeleting(false);
    }
  };

  // ── DataGrid columns ──
  const columns = [
    {
      field: "id",
      headerName: "Dispatch ID",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography
          variant="body2"
          onClick={() => router.push(`/dispatch_service/${params.row.id}`)}
          sx={{
            cursor: "pointer",
            color: "#6366f1",
            fontFamily: "monospace",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline", color: "#4f46e5" },
          }}
        >
          {String(params.row.id).substring(0, 12)}...
        </Typography>
      ),
    },
    { field: "orderId", headerName: "Order ID", flex: 1, minWidth: 150 },
    { field: "vehicleId", headerName: "Vehicle ID", flex: 0.8, minWidth: 120 },
    { field: "driverId", headerName: "Driver ID", flex: 0.8, minWidth: 120 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      minWidth: 120,
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
      headerName: "Actions",
      type: "actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }} />}
          label="View"
          onClick={() => router.push(`/dispatch_service/${params.row.id}`)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlineIcon sx={{ color: "#ef4444", "&:hover": { color: "#b91c1c" } }} />}
          label="Delete"
          onClick={() => confirmDelete(params.row.id)}
        />,
      ],
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
            <LocalShippingIcon sx={{ fontSize: 32, color: "#6366f1" }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Dispatch Service
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDispatches}
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
              onClick={() => setWizardOpen(true)}
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
              New Dispatch
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Oversee dispatch operations, track shipments, and manage outbound deliveries from the warehouse.
        </Typography>
      </Box>

      {/* ── DataGrid ── */}
      <Paper
        elevation={0}
        sx={{
          height: 600,
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
        <DataGrid
          rows={dispatches}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* ══════════════════════════════════════════════════════
          CREATE DISPATCH DIALOG
          ══════════════════════════════════════════════════════ */}
      <Dialog
        open={wizardOpen}
        onClose={resetWizard}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Create New Dispatch
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <TextField
              label="Order ID"
              value={formData.orderId}
              onChange={handleInputChange("orderId")}
              size="small"
              fullWidth
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Vehicle ID"
                value={formData.vehicleId}
                onChange={handleInputChange("vehicleId")}
                size="small"
                fullWidth
                required
              />
              <TextField
                label="Driver ID"
                value={formData.driverId}
                onChange={handleInputChange("driverId")}
                size="small"
                fullWidth
                required
              />
            </Box>
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={handleInputChange("status")}
              size="small"
              fullWidth
            >
              {Object.keys(STATUS_MAP).map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_MAP[status].label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Route Details"
              value={formData.routeDetails}
              onChange={handleInputChange("routeDetails")}
              size="small"
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Delivery Notes"
              value={formData.deliveryNotes}
              onChange={handleInputChange("deliveryNotes")}
              size="small"
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={resetWizard} sx={{ color: "#64748b", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateDispatch}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#6366f1",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {submitting ? "Submitting…" : "Create Dispatch"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════
          DELETE CONFIRMATION DIALOG
          ══════════════════════════════════════════════════════ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Are you sure you want to delete this dispatch? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "#64748b", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDispatch}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            {deleting ? "Deleting..." : "Delete"}
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
