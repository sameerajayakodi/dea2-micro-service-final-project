"use client";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

const PRIORITY_OPTIONS = ["LOW", "NORMAL", "HIGH", "URGENT"];
const STATUS_OPTIONS = [
  "CREATED",
  "PICKING",
  "PICKED",
  "PACKING",
  "PACKED",
  "READY_TO_SHIP",
  "COMPLETED",
  "CANCELLED",
];

const buildInitialState = (record) => ({
  orderId: record?.orderId ?? "",
  pickerId: record?.pickerId ?? "",
  packerId: record?.packerId ?? "",
  priority: record?.priority ?? "NORMAL",
  status: record?.status ?? "CREATED",
  notes: record?.notes ?? "",
});

export default function PickPackFormDialog({
  open,
  record,
  loading,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(buildInitialState(record));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(record));
      setErrors({});
    }
  }, [open, record]);

  const isEdit = Boolean(record);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!String(form.orderId).trim()) {
      nextErrors.orderId = "Order ID is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      orderId: String(form.orderId).trim(),
      pickerId: String(form.pickerId).trim() || null,
      packerId: String(form.packerId).trim() || null,
      priority: form.priority,
      status: form.status,
      notes: String(form.notes).trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? "Edit Pick & Pack" : "Create Pick & Pack"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Order ID"
                value={form.orderId}
                onChange={(e) => handleChange("orderId", e.target.value)}
                error={!!errors.orderId}
                helperText={errors.orderId}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Picker ID"
                value={form.pickerId}
                onChange={(e) => handleChange("pickerId", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Packer ID"
                value={form.packerId}
                onChange={(e) => handleChange("packerId", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={form.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                {PRIORITY_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Notes"
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
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
