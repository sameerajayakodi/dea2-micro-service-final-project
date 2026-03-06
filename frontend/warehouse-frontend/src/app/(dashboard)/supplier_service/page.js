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
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  getAllSuppliers,
  createSupplier,
  updateSupplierStatus,
} from "@/services/supplier_service/supplierApi";

/* ── Supplier Status → Chip color ─────────────────────────── */
const SUPPLIER_STATUS_MAP = {
  ACTIVE: { color: "success", label: "Active" },
  INACTIVE: { color: "default", label: "Inactive" },
};

const getSupplierChip = (status) => {
  const s = (status ?? "").toUpperCase();
  return SUPPLIER_STATUS_MAP[s] ?? { color: "default", label: status ?? "Unknown" };
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function SupplierServicePage() {
  const router = useRouter();

  // ── Supplier state ──
  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(true);

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

  // ── Toast ──
  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });
  const showToast = (severity, msg) => setToast({ open: true, severity, msg });

  /* ── Fetchers ──────────────────────────────────────────── */
  const fetchSuppliers = useCallback(async () => {
    setSupplierLoading(true);
    try {
      const { data } = await getAllSuppliers();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setSuppliers(rows);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      showToast("error", "Failed to load suppliers");
    } finally {
      setSupplierLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

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
              onClick={fetchSuppliers}
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
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Manage supplier relationships, track supplier performance, and handle procurement operations.
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
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc", color: "#64748b", fontWeight: 600 },
          "& .MuiDataGrid-columnSeparator": { color: "#e2e8f0" },
          "& .MuiDataGrid-cell": { borderColor: "#f1f5f9" },
          "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
          "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #f1f5f9" },
        }}
      >
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
