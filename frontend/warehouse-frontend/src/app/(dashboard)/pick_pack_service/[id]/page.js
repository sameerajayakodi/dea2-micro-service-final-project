"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

import { Toast } from "@/components/workforce/shared";
import {
  addPackingDetails,
  completePacking,
  completePicking,
  getPickPackById,
  startPacking,
  startPicking,
  updatePickQuantity,
} from "@/services/pick_pack";

const statusColor = (value) => {
  const status = String(value || "").toUpperCase();
  if (["COMPLETED", "READY_TO_SHIP"].includes(status)) return "success";
  if (["PICKING", "PACKING", "PICKED"].includes(status)) return "warning";
  if (status === "PENDING") return "info";
  if (status === "CANCELLED") return "error";
  return "default";
};

function UpdatePickQuantityDialog({ open, items, loading, onClose, onSubmit }) {
  const [itemId, setItemId] = useState("");
  const [quantityPicked, setQuantityPicked] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setItemId(items[0]?.itemId || "");
      setQuantityPicked("");
      setError("");
    }
  }, [open, items]);

  const handleSubmit = () => {
    const qty = Number(quantityPicked);
    if (!itemId || Number.isNaN(qty) || qty < 0) {
      setError("Select item and enter valid picked quantity");
      return;
    }

    onSubmit({ itemId, quantityPicked: qty });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Update Picked Quantity</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            label="Item"
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
            disabled={items.length === 0}
          >
            {items.map((item, index) => (
              <MenuItem key={`${item.itemId || index}-${index}`} value={item.itemId}>
                {item.itemId}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Quantity Picked"
            value={quantityPicked}
            onChange={(event) => setQuantityPicked(event.target.value)}
            error={Boolean(error)}
            helperText={error || " "}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "#64748b" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || items.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddPackingDetailsDialog({ open, loading, onClose, onSubmit }) {
  const [packingType, setPackingType] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPackingType("");
      setWeight("");
      setDimensions("");
      setError("");
    }
  }, [open]);

  const handleSubmit = () => {
    const parsedWeight = Number(weight);
    if (!packingType.trim() || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      setError("Packing type and positive weight are required");
      return;
    }

    onSubmit([
      {
        packingType: packingType.trim(),
        weight: parsedWeight,
        dimensions: dimensions.trim() || null,
      },
    ]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Add Packing Details</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Packing Type"
            value={packingType}
            onChange={(event) => setPackingType(event.target.value)}
          />

          <TextField
            fullWidth
            type="number"
            label="Weight"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            error={Boolean(error)}
            helperText={error || " "}
            slotProps={{
              htmlInput: {
                min: 0,
                step: 0.1,
              },
            }}
          />

          <TextField
            fullWidth
            label="Dimensions"
            placeholder="20x10x8"
            value={dimensions}
            onChange={(event) => setDimensions(event.target.value)}
          />
        </Stack>
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
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PickPackServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pickQtyOpen, setPickQtyOpen] = useState(false);
  const [packingOpen, setPackingOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPickPackById(id);
      setRecord(res.data);
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchRecord();
  }, [id, fetchRecord]);

  const items = useMemo(() => {
    if (!Array.isArray(record?.items)) return [];
    return record.items;
  }, [record]);

  const packingDetails = useMemo(() => {
    if (!Array.isArray(record?.packingDetails)) return [];
    return record.packingDetails;
  }, [record]);

  const runWorkflowAction = async (request, successMessage) => {
    try {
      setActionLoading(true);
      await request();
      setToast({ open: true, message: successMessage, severity: "success" });
      await fetchRecord();
    } catch (error) {
      const message = error.response?.data?.message || "Workflow action failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const renderWorkflowActions = () => {
    const status = String(record?.status || "").toUpperCase();

    if (status === "PENDING") {
      return (
        <Button
          variant="outlined"
          onClick={() => runWorkflowAction(() => startPicking(id), "Picking started")}
          disabled={actionLoading}
        >
          Start Picking
        </Button>
      );
    }

    if (status === "PICKING") {
      return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button variant="outlined" onClick={() => setPickQtyOpen(true)} disabled={actionLoading}>
            Update Picked Quantity
          </Button>
          <Button
            variant="contained"
            onClick={() => runWorkflowAction(() => completePicking(id), "Picking completed")}
            disabled={actionLoading}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Complete Picking
          </Button>
        </Stack>
      );
    }

    if (status === "PICKED") {
      return (
        <Button
          variant="outlined"
          onClick={() => runWorkflowAction(() => startPacking(id), "Packing started")}
          disabled={actionLoading}
        >
          Start Packing
        </Button>
      );
    }

    if (status === "PACKING") {
      return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button variant="outlined" onClick={() => setPackingOpen(true)} disabled={actionLoading}>
            Add Packing Details
          </Button>
          <Button
            variant="contained"
            onClick={() => runWorkflowAction(() => completePacking(id), "Packing completed")}
            disabled={actionLoading}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Complete Packing
          </Button>
        </Stack>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  if (!record) {
    return (
      <Box>
        <Typography variant="h6" sx={{ color: "#1e293b", mb: 2 }}>
          Pick & Pack record not found.
        </Typography>
        <Typography
          role="button"
          onClick={() => router.push("/pick_pack_service")}
          sx={{ color: "#6366f1", cursor: "pointer", width: "fit-content" }}
        >
          Back to Pick & Pack
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton
          onClick={() => router.push("/pick_pack_service")}
          sx={{ color: "#64748b", "&:hover": { bgcolor: "#f1f5f9" } }}
        >
          <ArrowBackIcon />
        </IconButton>

        <LocalShippingIcon sx={{ color: "#6366f1" }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Pick & Pack Details
        </Typography>
        <Chip
          size="small"
          label={record.status || "UNKNOWN"}
          color={statusColor(record.status)}
          sx={{ fontWeight: 600, textTransform: "uppercase" }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>{renderWorkflowActions()}</Box>

      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}
      >
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <Typography><strong>PickPack ID:</strong> {record.pickPackId || record.id}</Typography>
          <Typography><strong>Order ID:</strong> {record.orderId || "—"}</Typography>
          <Typography><strong>Worker ID:</strong> {record.workerId || "—"}</Typography>
          <Typography>
            <strong>Pick Date:</strong> {record.pickDate ? dayjs(record.pickDate).format("YYYY-MM-DD HH:mm") : "—"}
          </Typography>
          <Typography>
            <strong>Pack Date:</strong> {record.packDate ? dayjs(record.packDate).format("YYYY-MM-DD HH:mm") : "—"}
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Inventory2Icon sx={{ color: "#6366f1" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Items ({items.length})
          </Typography>
        </Box>

        {items.length === 0 ? (
          <Typography sx={{ color: "#94a3b8" }}>No item details available.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {items.map((item, index) => (
              <Box
                key={`${item.itemId || index}-${index}`}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "#f1f5f9",
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr 1fr" },
                  gap: 1,
                }}
              >
                <Typography><strong>Item:</strong> {item.itemId || item.sku || "—"}</Typography>
                <Typography><strong>To Pick:</strong> {item.quantityToPick ?? 0}</Typography>
                <Typography><strong>Picked:</strong> {item.quantityPicked ?? 0}</Typography>
                <Typography><strong>Bin:</strong> {item.binNo || "—"}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: 3, mt: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
          Packing Details ({packingDetails.length})
        </Typography>

        {packingDetails.length === 0 ? (
          <Typography sx={{ color: "#94a3b8" }}>No packing details available.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {packingDetails.map((detail, index) => (
              <Box
                key={`${detail.packingType || index}-${index}`}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "#f1f5f9",
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                  gap: 1,
                }}
              >
                <Typography><strong>Type:</strong> {detail.packingType || "—"}</Typography>
                <Typography><strong>Weight:</strong> {detail.weight ?? "—"}</Typography>
                <Typography><strong>Dimensions:</strong> {detail.dimensions || "—"}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <UpdatePickQuantityDialog
        open={pickQtyOpen}
        items={items}
        loading={actionLoading}
        onClose={() => setPickQtyOpen(false)}
        onSubmit={async ({ itemId, quantityPicked }) => {
          await runWorkflowAction(
            () => updatePickQuantity(id, itemId, quantityPicked),
            "Picked quantity updated",
          );
          setPickQtyOpen(false);
        }}
      />

      <AddPackingDetailsDialog
        open={packingOpen}
        loading={actionLoading}
        onClose={() => setPackingOpen(false)}
        onSubmit={async (details) => {
          await runWorkflowAction(() => addPackingDetails(id, details), "Packing details added");
          setPackingOpen(false);
        }}
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
