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
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

const buildEmptyItem = () => ({
  itemId: "",
  quantityToPick: 1,
  binNo: "",
});

const buildInitialState = () => ({
  orderId: "",
  workerId: "",
  items: [buildEmptyItem()],
});

export default function PickPackFormDialog({ open, loading, onClose, onSubmit }) {
  const [form, setForm] = useState(buildInitialState());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(buildInitialState());
      setErrors({});
    }
  }, [open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const nextItems = prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, items: nextItems };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, buildEmptyItem()] }));
  };

  const removeItem = (index) => {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev;
      return {
        ...prev,
        items: prev.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!String(form.orderId).trim()) {
      nextErrors.orderId = "Order ID is required";
    }

    const worker = Number(form.workerId);
    if (!String(form.workerId).trim() || Number.isNaN(worker) || worker <= 0) {
      nextErrors.workerId = "Worker ID must be a valid positive number";
    }

    form.items.forEach((item, index) => {
      if (!String(item.itemId).trim()) {
        nextErrors[`itemId-${index}`] = "Item ID is required";
      }

      const quantityToPick = Number(item.quantityToPick);
      if (Number.isNaN(quantityToPick) || quantityToPick <= 0) {
        nextErrors[`quantityToPick-${index}`] = "Quantity must be greater than 0";
      }

      if (!String(item.binNo).trim()) {
        nextErrors[`binNo-${index}`] = "Bin No is required";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      orderId: String(form.orderId).trim(),
      workerId: Number(form.workerId),
      items: form.items.map((item) => ({
        itemId: String(item.itemId).trim(),
        quantityToPick: Number(item.quantityToPick),
        binNo: String(item.binNo).trim(),
      })),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Create Pick & Pack Task</DialogTitle>

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
                type="number"
                label="Worker ID"
                value={form.workerId}
                onChange={(e) => handleChange("workerId", e.target.value)}
                error={!!errors.workerId}
                helperText={errors.workerId}
                slotProps={{
                  htmlInput: {
                    min: 1,
                  },
                }}
              />
            </Grid>

            <Grid size={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: "#475569", fontWeight: 600 }}>
                  Picking Items
                </Typography>

                <Button size="small" startIcon={<AddIcon />} onClick={addItem} disabled={loading}>
                  Add Item
                </Button>
              </Stack>

              <Stack spacing={1.5}>
                {form.items.map((item, index) => (
                  <Box
                    key={`item-${index}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="Item ID"
                          value={item.itemId}
                          onChange={(e) => handleItemChange(index, "itemId", e.target.value)}
                          error={!!errors[`itemId-${index}`]}
                          helperText={errors[`itemId-${index}`]}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Qty To Pick"
                          value={item.quantityToPick}
                          onChange={(e) =>
                            handleItemChange(index, "quantityToPick", e.target.value)
                          }
                          error={!!errors[`quantityToPick-${index}`]}
                          helperText={errors[`quantityToPick-${index}`]}
                          slotProps={{
                            htmlInput: {
                              min: 1,
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="Bin No"
                          value={item.binNo}
                          onChange={(e) => handleItemChange(index, "binNo", e.target.value)}
                          error={!!errors[`binNo-${index}`]}
                          helperText={errors[`binNo-${index}`]}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <IconButton
                            size="small"
                            onClick={() => removeItem(index)}
                            disabled={loading || form.items.length <= 1}
                            sx={{ color: "#ef4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
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
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
