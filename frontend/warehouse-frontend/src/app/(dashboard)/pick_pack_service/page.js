"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
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
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
import {
  EmptyState,
  LoadingState,
  Toast,
} from "@/components/workforce/shared";
import PickPackFormDialog from "@/components/services/pick_pack_service/from";
import {
  addPackingDetails,
  completePacking,
  completePicking,
  createPickPack,
  getAllPickPacks,
  startPacking,
  startPicking,
  updatePickQuantity,
} from "@/services/pick_pack";
import { getAllOrders } from "@/services/orders/ordersApi";
import { getAllWorkers } from "@/services/workforce/workersApi";

const getRowId = (row) => row.pickPackId ?? row.id;

const statusColor = (value) => {
  const status = String(value || "").toUpperCase();
  if (["COMPLETED", "READY_TO_SHIP"].includes(status)) return "success";
  if (["PICKING", "PACKING", "PICKED"].includes(status)) return "warning";
  if (status === "PENDING") return "info";
  if (status === "CANCELLED") return "error";
  return "default";
};

const getCreatedDate = (row) => row.pickDate || row.createdAt || row.createdDate;

function UpdatePickQuantityDialog({ open, row, loading, onClose, onSubmit }) {
  const [itemId, setItemId] = useState("");
  const [quantityPicked, setQuantityPicked] = useState("");
  const [error, setError] = useState("");

  const items = Array.isArray(row?.items) ? row.items : [];

  useEffect(() => {
    if (open) {
      setItemId(items[0]?.itemId || "");
      setQuantityPicked("");
      setError("");
    }
  }, [open, row]);

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

export default function PickPackServicePage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [pickQtyTarget, setPickQtyTarget] = useState(null);
  const [packingTarget, setPackingTarget] = useState(null);
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllPickPacks();
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
          ? res.data.content
          : [];
      setRows(list);
    } catch {
      setToast({
        open: true,
        message: "Failed to load Pick & Pack records",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    let mounted = true;

    const fetchLookups = async () => {
      try {
        const [ordersRes, workersRes] = await Promise.all([getAllOrders(), getAllWorkers()]);

        if (!mounted) return;

        const orderList = Array.isArray(ordersRes?.data)
          ? ordersRes.data
          : Array.isArray(ordersRes?.data?.content)
            ? ordersRes.data.content
            : [];

        const workerList = Array.isArray(workersRes?.data)
          ? workersRes.data
          : Array.isArray(workersRes?.data?.content)
            ? workersRes.data.content
            : [];

        setOrders(orderList);
        setWorkers(workerList);
      } catch {
        if (!mounted) return;
        setOrders([]);
        setWorkers([]);
      }
    };

    fetchLookups();

    return () => {
      mounted = false;
    };
  }, []);

  const orderMap = useMemo(
    () =>
      orders.reduce((acc, order) => {
        if (order?.id !== undefined && order?.id !== null) {
          acc[String(order.id)] = order.orderNumber || String(order.id);
        }
        return acc;
      }, {}),
    [orders],
  );

  const workerMap = useMemo(
    () =>
      workers.reduce((acc, worker) => {
        if (worker?.id !== undefined && worker?.id !== null) {
          acc[String(worker.id)] =
            worker.name || worker.fullName || worker.employeeCode || String(worker.id);
        }
        return acc;
      }, {}),
    [workers],
  );

  const handleCreate = () => {
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      await createPickPack(payload);
      setToast({ open: true, message: "Pick & Pack task created", severity: "success" });
      setFormOpen(false);
      fetchRows();
    } catch (err) {
      const message = err.response?.data?.message || "Operation failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const runWorkflowAction = async (request, successMessage) => {
    try {
      setWorkflowLoading(true);
      await request();
      setToast({ open: true, message: successMessage, severity: "success" });
      await fetchRows();
    } catch (err) {
      const message = err.response?.data?.message || "Workflow action failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setWorkflowLoading(false);
    }
  };

  const renderWorkflowActions = (row) => {
    const status = String(row.status || "").toUpperCase();
    const id = getRowId(row);

    if (status === "PENDING") {
      return (
        <Button
          size="small"
          variant="outlined"
          onClick={(event) => {
            event.stopPropagation();
            runWorkflowAction(() => startPicking(id), "Picking started");
          }}
          disabled={workflowLoading}
        >
          Start Picking
        </Button>
      );
    }

    if (status === "PICKING") {
      return (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              setPickQtyTarget(row);
            }}
            disabled={workflowLoading}
          >
            Update Picked Quantity
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={(event) => {
              event.stopPropagation();
              runWorkflowAction(() => completePicking(id), "Picking completed");
            }}
            disabled={workflowLoading}
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
          size="small"
          variant="outlined"
          onClick={(event) => {
            event.stopPropagation();
            runWorkflowAction(() => startPacking(id), "Packing started");
          }}
          disabled={workflowLoading}
        >
          Start Packing
        </Button>
      );
    }

    if (status === "PACKING") {
      return (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              setPackingTarget(row);
            }}
            disabled={workflowLoading}
          >
            Add Packing Details
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={(event) => {
              event.stopPropagation();
              runWorkflowAction(() => completePacking(id), "Packing completed");
            }}
            disabled={workflowLoading}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Complete Packing
          </Button>
        </Stack>
      );
    }

    return "—";
  };

  const columns = useMemo(
    () => [
      {
        id: "orderId",
        label: "Order",
        sortable: true,
        render: (row) => orderMap[String(row.orderId)] || row.orderId || "—",
      },
      {
        id: "workerId",
        label: "Worker",
        sortable: true,
        render: (row) => workerMap[String(row.workerId)] || row.workerId || "—",
      },
      {
        id: "status",
        label: "Status",
        sortable: true,
        render: (row) => (
          <Chip
            label={row.status || "UNKNOWN"}
            color={statusColor(row.status)}
            size="small"
            sx={{ fontWeight: 600, textTransform: "uppercase" }}
          />
        ),
      },
      {
        id: "createdAt",
        label: "Created Date",
        sortable: true,
        render: (row) => {
          const createdDate = getCreatedDate(row);
          return createdDate ? dayjs(createdDate).format("YYYY-MM-DD HH:mm") : "—";
        },
      },
      {
        id: "itemsCount",
        label: "Items",
        sortable: true,
        render: (row) => (Array.isArray(row.items) ? row.items.length : 0),
      },
      {
        id: "actions",
        label: "Workflow",
        sortable: false,
        align: "right",
        render: (row) => renderWorkflowActions(row),
      },
    ],
    [orderMap, workerMap, workflowLoading],
  );

  if (loading) return <LoadingState message="Loading Pick & Pack tasks..." />;

  return (
    <Box>
      <PageHeader
        title="Pick & Pack Service"
        subtitle="Manage warehouse picking and packing tasks from a single workflow screen."
        icon={<LocalShippingIcon sx={{ fontSize: 32 }} />}
        count={rows.length}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            New Task
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={["orderId", "workerId", "status"]}
        onRowClick={(row) => router.push(`/pick_pack_service/${getRowId(row)}`)}
        emptyComponent={
          <EmptyState
            icon={<Inventory2Icon />}
            message="No Pick & Pack records found."
          />
        }
      />

      <PickPackFormDialog
        open={formOpen}
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <UpdatePickQuantityDialog
        open={Boolean(pickQtyTarget)}
        row={pickQtyTarget}
        loading={workflowLoading}
        onClose={() => setPickQtyTarget(null)}
        onSubmit={async ({ itemId, quantityPicked }) => {
          if (!pickQtyTarget) return;
          await runWorkflowAction(
            () => updatePickQuantity(getRowId(pickQtyTarget), itemId, quantityPicked),
            "Picked quantity updated",
          );
          setPickQtyTarget(null);
        }}
      />

      <AddPackingDetailsDialog
        open={Boolean(packingTarget)}
        loading={workflowLoading}
        onClose={() => setPackingTarget(null)}
        onSubmit={async (packingDetails) => {
          if (!packingTarget) return;
          await runWorkflowAction(
            () => addPackingDetails(getRowId(packingTarget), packingDetails),
            "Packing details added",
          );
          setPackingTarget(null);
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
