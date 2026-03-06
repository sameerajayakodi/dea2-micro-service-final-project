"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
import DispatchFormDialog from "@/components/dispatch/DispatchFormDialog";
import {
  LoadingState,
  EmptyState,
  ConfirmDialog,
  Toast,
} from "@/components/workforce/shared";
import {
  getAllDispatches,
  createDispatch,
  updateDispatch,
  deleteDispatch,
} from "@/services/dispatch";

/* ---------- Status chip helpers ---------- */
const statusConfig = {
  PENDING: {
    label: "Pending",
    bgcolor: "#fef3c7",
    color: "#92400e",
    icon: <PendingActionsIcon sx={{ fontSize: 16 }} />,
  },
  IN_TRANSIT: {
    label: "In Transit",
    bgcolor: "#dbeafe",
    color: "#1e40af",
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />,
  },
  DELIVERED: {
    label: "Delivered",
    bgcolor: "#dcfce7",
    color: "#166534",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
  },
  DELAYED: {
    label: "Delayed",
    bgcolor: "#fee2e2",
    color: "#991b1b",
    icon: <WarningAmberIcon sx={{ fontSize: 16 }} />,
  },
};

const StatusChip = ({ status }) => {
  const cfg = statusConfig[status] || {
    label: status,
    bgcolor: "#f1f5f9",
    color: "#475569",
  };
  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bgcolor,
        color: cfg.color,
        fontWeight: 600,
        "& .MuiChip-icon": { color: cfg.color },
      }}
    />
  );
};

/* ---------- Truncate long UUID for display ---------- */
const shortId = (id) => (id ? `${id.slice(0, 8)}…` : "—");

/* ---------- Format datetime ---------- */
const fmtDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DispatchServicePage() {
  const router = useRouter();
  const [dispatches, setDispatches] = useState([]);
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

  /* ---- Fetch data ---- */
  const fetchDispatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllDispatches();
      setDispatches(res.data);
    } catch {
      setToast({
        open: true,
        message: "Failed to load dispatches",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  /* ---- Handlers ---- */
  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      setSaving(true);
      if (editing) {
        await updateDispatch(editing.id, data);
        setToast({
          open: true,
          message: "Dispatch updated successfully",
          severity: "success",
        });
      } else {
        await createDispatch(data);
        setToast({
          open: true,
          message: "Dispatch created successfully",
          severity: "success",
        });
      }
      setFormOpen(false);
      fetchDispatches();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteDispatch(deleteTarget.id);
      setToast({
        open: true,
        message: "Dispatch deleted",
        severity: "success",
      });
      setDeleteTarget(null);
      fetchDispatches();
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  /* ---- Stats ---- */
  const statusCounts = dispatches.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    { PENDING: 0, IN_TRANSIT: 0, DELIVERED: 0, DELAYED: 0 },
  );

  const statsCards = [
    {
      label: "Total Dispatches",
      value: dispatches.length,
      color: "#6366f1",
      icon: <LocalShippingIcon />,
    },
    {
      label: "Pending",
      value: statusCounts.PENDING,
      color: "#f59e0b",
      icon: <PendingActionsIcon />,
    },
    {
      label: "In Transit",
      value: statusCounts.IN_TRANSIT,
      color: "#3b82f6",
      icon: <LocalShippingOutlinedIcon />,
    },
    {
      label: "Delivered",
      value: statusCounts.DELIVERED,
      color: "#22c55e",
      icon: <CheckCircleOutlineIcon />,
    },
    {
      label: "Delayed",
      value: statusCounts.DELAYED,
      color: "#ef4444",
      icon: <WarningAmberIcon />,
    },
  ];

  /* ---- Table columns ---- */
  const columns = [
    {
      id: "id",
      label: "ID",
      sortable: true,
      render: (row) => (
        <Tooltip title={row.id}>
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
          >
            {shortId(row.id)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: "orderId",
      label: "Order ID",
      sortable: true,
      render: (row) => (
        <Tooltip title={row.orderId}>
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
          >
            {shortId(row.orderId)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: "vehicleId",
      label: "Vehicle",
      sortable: true,
      render: (row) => (
        <Tooltip title={row.vehicleId || "Not assigned"}>
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {shortId(row.vehicleId)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: "driverId",
      label: "Driver",
      sortable: true,
      render: (row) => (
        <Tooltip title={row.driverId || "Not assigned"}>
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {shortId(row.driverId)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      id: "createdAt",
      label: "Created",
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>
          {fmtDate(row.createdAt)}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dispatch_service/${row.id}`);
              }}
              sx={{ color: "#6366f1" }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              sx={{ color: "#f59e0b" }}
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

  if (loading) return <LoadingState message="Loading dispatches..." />;

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Dispatch & Transportation"
        subtitle="Manage dispatch operations, track shipments, and oversee outbound deliveries from the warehouse."
        icon={<LocalShippingIcon sx={{ fontSize: 32 }} />}
        count={dispatches.length}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            New Dispatch
          </Button>
        }
      />

      {/* Stats cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statsCards.map((stat) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={stat.label}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    "0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.04)",
                },
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", fontWeight: 500, mb: 0.5, fontSize: "0.75rem" }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: stat.color }}
                >
                  {stat.value}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: `${stat.color}15`,
                  width: 44,
                  height: 44,
                }}
              >
                <Box sx={{ color: stat.color, display: "flex" }}>{stat.icon}</Box>
              </Avatar>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Data table */}
      <DataTable
        columns={columns}
        rows={dispatches}
        searchKeys={["orderId", "vehicleId", "driverId", "status", "routeDetails"]}
        onRowClick={(row) => router.push(`/dispatch_service/${row.id}`)}
        emptyComponent={
          <EmptyState
            icon={<LocalShippingIcon />}
            message="No dispatches found. Create one to get started!"
          />
        }
      />

      {/* Form dialog */}
      <DispatchFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        dispatch={editing}
        loading={saving}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Dispatch"
        message={`Are you sure you want to delete dispatch "${shortId(deleteTarget?.id)}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Toast notifications */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
