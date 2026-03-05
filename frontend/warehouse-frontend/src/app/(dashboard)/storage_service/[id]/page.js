"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import PageHeader from "@/components/workforce/PageHeader";
import { EmptyState, LoadingState, Toast } from "@/components/workforce/shared";
import {
  getStorageLocationById,
  updateStorageLocationCapacity,
} from "@/services/storage_service";

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

export default function StorageLocationDetailsPage() {
  const params = useParams();
  const id = params?.id;

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [capacityForm, setCapacityForm] = useState({
    addedWeight: "",
    addedVolume: "",
  });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadLocation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStorageLocationById(id);
      setLocation(response.data);
    } catch (err) {
      setToast({
        open: true,
        message: getApiErrorMessage(err, "Failed to load location details"),
        severity: "error",
      });
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadLocation();
  }, [id, loadLocation]);

  const cardData = useMemo(() => {
    if (!location) return [];

    return [
      { label: "Location ID", value: location.locationId },
      { label: "Zone", value: location.zone },
      { label: "Rack", value: location.rackNo },
      { label: "Bin", value: location.binNo },
      { label: "Current Weight", value: location.currentWeight ?? 0 },
      { label: "Max Weight", value: location.maxWeight ?? 0 },
      { label: "Current Volume", value: location.currentVolume ?? 0 },
      { label: "Max Volume", value: location.maxVolume ?? 0 },
    ];
  }, [location]);

  const handleCapacityUpdate = async () => {
    const weight = Number(capacityForm.addedWeight || 0);
    const volume = Number(capacityForm.addedVolume || 0);

    if (Number.isNaN(weight) || Number.isNaN(volume)) {
      setToast({
        open: true,
        message: "Capacity values must be valid numbers",
        severity: "error",
      });
      return;
    }

    try {
      setUpdating(true);
      await updateStorageLocationCapacity(id, {
        addedWeight: weight,
        addedVolume: volume,
      });
      setToast({
        open: true,
        message: "Capacity updated successfully",
        severity: "success",
      });
      setCapacityForm({ addedWeight: "", addedVolume: "" });
      loadLocation();
    } catch (err) {
      setToast({
        open: true,
        message: getApiErrorMessage(err, "Failed to update capacity"),
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState message="Loading storage location..." />;

  if (!location) {
    return <EmptyState icon={<WarehouseIcon />} message="Storage location not found." />;
  }

  const status = String(location.availabilityStatus ?? "UNKNOWN").toUpperCase();
  const statusStyle = statusStyles[status] || { bgcolor: "#f1f5f9", color: "#334155" };

  return (
    <Box>
      <PageHeader
        title={`Storage Location #${location.locationId}`}
        subtitle="View capacity metrics and apply weight/volume changes. Use negative values to release capacity."
        icon={<WarehouseIcon sx={{ fontSize: 32 }} />}
        backHref="/storage_service"
      />

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Chip
            label={status.replace(/_/g, " ")}
            size="small"
            sx={{ fontWeight: 600, ...statusStyle }}
          />
        </Box>

        <Grid container spacing={2}>
          {cardData.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "#e2e8f0",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  {item.label}
                </Typography>
                <Typography variant="body1" sx={{ color: "#1e293b", fontWeight: 600 }}>
                  {item.value ?? "-"}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <EqualizerIcon sx={{ color: "#0f766e" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Capacity Update
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
          Use positive numbers to consume capacity and negative numbers to release it.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth
              type="number"
              label="Added Weight"
              value={capacityForm.addedWeight}
              onChange={(e) =>
                setCapacityForm((current) => ({ ...current, addedWeight: e.target.value }))
              }
              helperText="Example: 15.5 or -8"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth
              type="number"
              label="Added Volume"
              value={capacityForm.addedVolume}
              onChange={(e) =>
                setCapacityForm((current) => ({ ...current, addedVolume: e.target.value }))
              }
              helperText="Example: 4.2 or -2"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCapacityUpdate}
              disabled={updating}
              startIcon={updating ? <CircularProgress size={16} /> : null}
              sx={{
                height: "100%",
                minHeight: 56,
                bgcolor: "#6366f1",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </Box>
  );
}
