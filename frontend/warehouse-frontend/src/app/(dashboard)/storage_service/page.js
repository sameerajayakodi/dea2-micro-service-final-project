"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarehouseIcon from "@mui/icons-material/Warehouse";
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
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";

import DataTable from "@/components/workforce/DataTable";
import PageHeader from "@/components/workforce/PageHeader";
import {
  ConfirmDialog,
  EmptyState,
  LoadingState,
  Toast,
} from "@/components/workforce/shared";
import {
  createStorageLocation,
  deleteStorageLocation,
  getAllStorageLocations,
  getAvailableStorageLocations,
  updateStorageLocation,
} from "@/services/storage_service";

const formInitialState = {
  zone: "",
  rackNo: "",
  binNo: "",
  maxWeight: "",
  maxVolume: "",
};

const statusStyles = {
  AVAILABLE: { bgcolor: "#dcfce7", color: "#166534" },
  PARTIAL: { bgcolor: "#dbeafe", color: "#1e40af" },
  FULL: { bgcolor: "#fee2e2", color: "#991b1b" },
};

function getApiErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (data?.message) {
    if (Array.isArray(data.details) && data.details.length > 0) {
      return `${data.message}: ${data.details.join(" | ")}`;
    }
    return data.message;
  }
  return fallback;
}

function LocationFormDialog({ open, location, loading, onClose, onSubmit }) {
  const [form, setForm] = useState(formInitialState);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(location);

  useEffect(() => {
    if (location) {
      setForm({
        zone: location.zone ?? "",
        rackNo: location.rackNo ?? "",
        binNo: location.binNo ?? "",
        maxWeight: location.maxWeight ?? "",
        maxVolume: location.maxVolume ?? "",
      });
      return;
    }
    setForm(formInitialState);
  }, [location, open]);

  const validate = () => {
    const nextErrors = {};

    if (!form.zone.trim()) nextErrors.zone = "Zone is required";
    if (!form.rackNo.trim()) nextErrors.rackNo = "Rack number is required";
    if (!form.binNo.trim()) nextErrors.binNo = "Bin number is required";

    const maxWeight = Number(form.maxWeight);
    const maxVolume = Number(form.maxVolume);

    if (Number.isNaN(maxWeight) || maxWeight <= 0) {
      nextErrors.maxWeight = "Max weight must be greater than 0";
    }
    if (Number.isNaN(maxVolume) || maxVolume <= 0) {
      nextErrors.maxVolume = "Max volume must be greater than 0";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      zone: form.zone.trim(),
      rackNo: form.rackNo.trim(),
      binNo: form.binNo.trim(),
      maxWeight: Number(form.maxWeight),
      maxVolume: Number(form.maxVolume),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? "Edit Storage Location" : "Create Storage Location"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Zone"
                value={form.zone}
                onChange={(e) => setForm((current) => ({ ...current, zone: e.target.value }))}
                error={Boolean(errors.zone)}
                helperText={errors.zone}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Rack"
                value={form.rackNo}
                onChange={(e) =>
                  setForm((current) => ({ ...current, rackNo: e.target.value }))
                }
                error={Boolean(errors.rackNo)}
                helperText={errors.rackNo}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Bin"
                value={form.binNo}
                onChange={(e) => setForm((current) => ({ ...current, binNo: e.target.value }))}
                error={Boolean(errors.binNo)}
                helperText={errors.binNo}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Weight"
                value={form.maxWeight}
                onChange={(e) =>
                  setForm((current) => ({ ...current, maxWeight: e.target.value }))
                }
                error={Boolean(errors.maxWeight)}
                helperText={errors.maxWeight}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Volume"
                value={form.maxVolume}
                onChange={(e) =>
                  setForm((current) => ({ ...current, maxVolume: e.target.value }))
                }
                error={Boolean(errors.maxVolume)}
                helperText={errors.maxVolume}
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
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
        >
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function StorageServicePage() {
  const router = useRouter();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = showOnlyAvailable
        ? await getAvailableStorageLocations()
        : await getAllStorageLocations();
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setToast({
        open: true,
        message: getApiErrorMessage(err, "Failed to load storage locations"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showOnlyAvailable]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const totals = useMemo(() => {
    return {
      totalLocations: locations.length,
      available: locations.filter(
        (location) => String(location.availabilityStatus).toUpperCase() === "AVAILABLE",
      ).length,
    };
  }, [locations]);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      if (editing) {
        await updateStorageLocation(editing.locationId, payload);
        setToast({
          open: true,
          message: "Storage location updated",
          severity: "success",
        });
      } else {
        await createStorageLocation(payload);
        setToast({
          open: true,
          message: "Storage location created",
          severity: "success",
        });
      }
      setFormOpen(false);
      setEditing(null);
      fetchLocations();
    } catch (err) {
      setToast({
        open: true,
        message: getApiErrorMessage(err, "Save operation failed"),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.locationId) return;

    try {
      setDeleting(true);
      await deleteStorageLocation(deleteTarget.locationId);
      setDeleteTarget(null);
      setToast({
        open: true,
        message: "Storage location deleted",
        severity: "success",
      });
      fetchLocations();
    } catch (err) {
      setToast({
        open: true,
        message: getApiErrorMessage(err, "Delete operation failed"),
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { id: "locationId", label: "ID", sortable: true },
    { id: "zone", label: "Zone", sortable: true },
    { id: "rackNo", label: "Rack", sortable: true },
    { id: "binNo", label: "Bin", sortable: true },
    {
      id: "availabilityStatus",
      label: "Status",
      sortable: true,
      render: (row) => {
        const status = String(row.availabilityStatus ?? "UNKNOWN").toUpperCase();
        const style = statusStyles[status] || {
          bgcolor: "#f1f5f9",
          color: "#334155",
        };

        return (
          <Chip
            size="small"
            label={status.replace(/_/g, " ")}
            sx={{ fontWeight: 600, ...style }}
          />
        );
      },
    },
    {
      id: "capacity",
      label: "Weight / Volume",
      sortable: false,
      render: (row) => `${row.currentWeight ?? 0}/${row.maxWeight ?? 0} | ${row.currentVolume ?? 0}/${row.maxVolume ?? 0}`,
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          <Tooltip title="Open details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/storage_service/${row.locationId}`);
              }}
              sx={{ color: "#0f766e" }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(row);
                setFormOpen(true);
              }}
              sx={{ color: "#6366f1" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row);
              }}
              sx={{ color: "#ef4444" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return <LoadingState message="Loading storage locations..." />;
  }

  return (
    <Box>
      <PageHeader
        title="Storage Service"
        subtitle="Manage storage zones, racks, bins, and available capacity across the warehouse."
        icon={<WarehouseIcon sx={{ fontSize: 32 }} />}
        count={totals.totalLocations}
        action={
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={() => router.push("/storage_service/available")}
            >
              Available Only Page
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLocations}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
            >
              Add Location
            </Button>
          </Box>
        }
      />

      <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
        <Chip
          label={`Available now: ${totals.available}`}
          sx={{ bgcolor: "#ccfbf1", color: "#115e59", fontWeight: 600 }}
        />
        <Chip
          clickable
          onClick={() => setShowOnlyAvailable((current) => !current)}
          label={showOnlyAvailable ? "Showing: Available" : "Showing: All"}
          sx={{
            bgcolor: showOnlyAvailable ? "#dcfce7" : "#e2e8f0",
            color: showOnlyAvailable ? "#166534" : "#334155",
            fontWeight: 600,
          }}
        />
      </Box>

      <DataTable
        columns={columns}
        rows={locations}
        searchKeys={["locationId", "zone", "rackNo", "binNo", "availabilityStatus"]}
        onRowClick={(row) => router.push(`/storage_service/${row.locationId}`)}
        emptyComponent={
          <EmptyState
            icon={<WarehouseIcon />}
            message="No storage locations found for current filter."
          />
        }
      />

      <LocationFormDialog
        open={formOpen}
        location={editing}
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Storage Location"
        message={`Delete location "${deleteTarget?.zone ?? ""} / ${deleteTarget?.rackNo ?? ""} / ${deleteTarget?.binNo ?? ""}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </Box>
  );
}
