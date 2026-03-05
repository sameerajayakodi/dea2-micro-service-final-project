"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import dayjs from "dayjs";

import { getDispatchById, updateDispatch } from "@/services/dispatches/dispatchesApi";

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

export default function DispatchDetailsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [dispatchData, setDispatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });

  const fetchDispatch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getDispatchById(id);
      setDispatchData(data);
      setFormData(data);
    } catch (err) {
      console.error("Fetch dispatch failed", err);
      setToast({ open: true, severity: "error", msg: "Failed to load dispatch details" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDispatch();
  }, [fetchDispatch]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDispatch(id, {
        orderId: formData.orderId,
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        status: formData.status,
        routeDetails: formData.routeDetails,
        deliveryNotes: formData.deliveryNotes,
      });
      setToast({ open: true, severity: "success", msg: "Dispatch updated successfully!" });
      setEditing(false);
      fetchDispatch();
    } catch (err) {
      console.error("Update failed", err);
      setToast({ open: true, severity: "error", msg: "Failed to update dispatch" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Loading dispatch details...</Typography>
      </Box>
    );
  }

  if (!dispatchData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Dispatch not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/dispatch_service")} sx={{ mt: 2 }}>
          Back to Dispatches
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center" }}>
        <IconButton onClick={() => router.push("/dispatch_service")} sx={{ color: "#64748b" }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LocalShippingIcon sx={{ fontSize: 28, color: "#6366f1" }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Dispatch Details
            </Typography>
            <Chip
              label={getStatusChipProps(dispatchData.status).label}
              color={getStatusChipProps(dispatchData.status).color}
              sx={{ ml: 2, fontWeight: 600 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", fontFamily: "monospace", mt: 0.5 }}>
            ID: {dispatchData.id}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDispatch}
          disabled={editing || saving}
        >
          Refresh
        </Button>
        {editing ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => { setEditing(false); setFormData(dispatchData); }} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        ) : (
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
            Edit Dispatch
          </Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Dispatch Information
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
          {/* Read-only / Form fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Order ID"
              value={editing ? formData.orderId : dispatchData.orderId}
              onChange={handleInputChange("orderId")}
              disabled={!editing}
              fullWidth
              InputProps={{ readOnly: !editing }}
            />
            <TextField
              label="Vehicle ID"
              value={editing ? formData.vehicleId : dispatchData.vehicleId}
              onChange={handleInputChange("vehicleId")}
              disabled={!editing}
              fullWidth
              InputProps={{ readOnly: !editing }}
            />
            <TextField
              label="Driver ID"
              value={editing ? formData.driverId : dispatchData.driverId}
              onChange={handleInputChange("driverId")}
              disabled={!editing}
              fullWidth
              InputProps={{ readOnly: !editing }}
            />
            <TextField
              select={editing}
              label="Status"
              value={editing ? formData.status : getStatusChipProps(dispatchData.status).label}
              onChange={handleInputChange("status")}
              disabled={!editing}
              fullWidth
              InputProps={{ readOnly: !editing }}
            >
              {editing && Object.keys(STATUS_MAP).map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_MAP[status].label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Route Details"
              value={editing ? formData.routeDetails : dispatchData.routeDetails || "No route details"}
              onChange={handleInputChange("routeDetails")}
              disabled={!editing}
              fullWidth
              multiline
              rows={4}
              InputProps={{ readOnly: !editing }}
            />
            <TextField
              label="Delivery Notes"
              value={editing ? formData.deliveryNotes : dispatchData.deliveryNotes || "No delivery notes"}
              onChange={handleInputChange("deliveryNotes")}
              disabled={!editing}
              fullWidth
              multiline
              rows={4}
              InputProps={{ readOnly: !editing }}
            />
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
