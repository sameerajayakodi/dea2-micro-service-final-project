"use client";

import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlaceIcon from "@mui/icons-material/Place";
import {
  Box,
  Button,
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

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
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
  updateStorageLocation,
} from "@/services/inventory";

const initialForm = {
  zone: "",
  rackNo: "",
  binNo: "",
  maxWeight: "",
  maxVolume: "",
};

function LocationFormDialog({ open, location, loading, onClose, onSubmit }) {
  const getInitialForm = () => {
    if (location) {
      return {
        zone: location.zone || "",
        rackNo: location.rackNo || "",
        binNo: location.binNo || "",
        maxWeight: String(location.maxWeight ?? ""),
        maxVolume: String(location.maxVolume ?? ""),
      };
    }
    return initialForm;
  };

  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(location);

  const validate = () => {
    const nextErrors = {};
    if (!form.zone.trim()) nextErrors.zone = "Zone is required";
    if (!form.rackNo.trim()) nextErrors.rackNo = "Rack number is required";
    if (!form.binNo.trim()) nextErrors.binNo = "Bin number is required";
    if (!form.maxWeight || Number(form.maxWeight) <= 0) {
      nextErrors.maxWeight = "Max weight must be greater than 0";
    }
    if (!form.maxVolume || Number(form.maxVolume) <= 0) {
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
        {isEdit ? "Edit Storage Location" : "Add Storage Location"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Zone"
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                error={!!errors.zone}
                helperText={errors.zone}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Rack"
                value={form.rackNo}
                onChange={(e) => setForm({ ...form, rackNo: e.target.value })}
                error={!!errors.rackNo}
                helperText={errors.rackNo}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Bin"
                value={form.binNo}
                onChange={(e) => setForm({ ...form, binNo: e.target.value })}
                error={!!errors.binNo}
                helperText={errors.binNo}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Weight"
                value={form.maxWeight}
                onChange={(e) => setForm({ ...form, maxWeight: e.target.value })}
                error={!!errors.maxWeight}
                helperText={errors.maxWeight}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Volume"
                value={form.maxVolume}
                onChange={(e) => setForm({ ...form, maxVolume: e.target.value })}
                error={!!errors.maxVolume}
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
          onClick={handleSubmit}
          variant="contained"
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

export default function StorageLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const res = await getAllStorageLocations();
      setLocations(res.data);
    } catch {
      setToast({
        open: true,
        message: "Failed to load storage locations",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

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
      fetchLocations();
    } catch (err) {
      const message = err.response?.data?.message || "Operation failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
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
      const message = err.response?.data?.message || "Delete failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { id: "locationId", label: "ID", sortable: true },
    { id: "zone", label: "Zone", sortable: true },
    { id: "rackNo", label: "Rack", sortable: true },
    { id: "binNo", label: "Bin", sortable: true },
    { id: "maxWeight", label: "Max Weight", sortable: true },
    { id: "maxVolume", label: "Max Volume", sortable: true },
    {
      id: "fullLocation",
      label: "Location",
      sortable: false,
      render: (row) => `${row.zone} / ${row.rackNo} / ${row.binNo}`,
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
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

  if (loading) return <LoadingState message="Loading storage locations..." />;

  return (
    <Box>
      <PageHeader
        title="Storage Locations"
        subtitle="Manage zones, racks, and bins used for inventory placement."
        icon={<PlaceIcon sx={{ fontSize: 32 }} />}
        backHref="/inventory_service"
        count={locations.length}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Add Location
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={locations}
        searchKeys={["zone", "rackNo", "binNo", "maxWeight", "maxVolume"]}
        emptyComponent={
          <EmptyState icon={<PlaceIcon />} message="No storage locations found." />
        }
      />

      <LocationFormDialog
        key={`${editing?.locationId ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        location={editing}
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Storage Location"
        message={`Delete location "${deleteTarget?.zone} / ${deleteTarget?.rackNo} / ${deleteTarget?.binNo}"?`}
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
