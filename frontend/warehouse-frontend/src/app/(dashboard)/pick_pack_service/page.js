"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
import {
  ConfirmDialog,
  EmptyState,
  LoadingState,
  Toast,
} from "@/components/workforce/shared";
import PickPackFormDialog from "@/components/services/pick_pack_service/from";
import {
  createPickPack,
  deletePickPack,
  getAllPickPacks,
  updatePickPack,
} from "@/services/pick_pack";

const getRowId = (row) => row.pickPackId ?? row.id;

const statusColor = (value) => {
  const status = String(value || "").toUpperCase();
  if (["COMPLETED", "PACKED", "READY_TO_SHIP"].includes(status)) return "success";
  if (["PICKING", "PACKING", "PICKED"].includes(status)) return "warning";
  if (status === "CANCELLED") return "error";
  return "default";
};

export default function PickPackServicePage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
        await updatePickPack(getRowId(editing), payload);
        setToast({ open: true, message: "Pick & Pack updated", severity: "success" });
      } else {
        await createPickPack(payload);
        setToast({ open: true, message: "Pick & Pack created", severity: "success" });
      }
      setFormOpen(false);
      fetchRows();
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
      await deletePickPack(getRowId(deleteTarget));
      setDeleteTarget(null);
      setToast({ open: true, message: "Pick & Pack deleted", severity: "success" });
      fetchRows();
    } catch (err) {
      const message = err.response?.data?.message || "Delete failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "reference",
        label: "Reference",
        sortable: true,
        render: (row) => row.referenceNo || getRowId(row),
      },
      {
        id: "orderId",
        label: "Order ID",
        sortable: true,
        render: (row) => row.orderId || "—",
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
        id: "priority",
        label: "Priority",
        sortable: true,
        render: (row) => row.priority || "NORMAL",
      },
      {
        id: "assigned",
        label: "Picker / Packer",
        sortable: false,
        render: (row) => `${row.pickerId || "—"} / ${row.packerId || "—"}`,
      },
      {
        id: "createdAt",
        label: "Created",
        sortable: true,
        render: (row) =>
          row.createdAt ? dayjs(row.createdAt).format("YYYY-MM-DD HH:mm") : "—",
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
                onClick={(event) => {
                  event.stopPropagation();
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
                onClick={(event) => {
                  event.stopPropagation();
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
    ],
    [],
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
        searchKeys={["referenceNo", "orderId", "status", "priority", "pickerId", "packerId"]}
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
        record={editing}
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Pick & Pack"
        message="Delete this Pick & Pack record? This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
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
