"use client";

import { useEffect, useState, useCallback } from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import {
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
import WorkforceOrderAssignDialog from "@/components/workforce/WorkforceOrderAssignDialog";
import {
  LoadingState,
  EmptyState,
  Toast,
} from "@/components/workforce/shared";
import {
  getAllWorkers,
} from "@/services/workforce";
import {
  getWorkforceOrders,
  assignWorkersToOrder,
  getAssignmentsByOrderId,
} from "@/services/workforce/workforceOrdersApi";

const statusColor = {
  CREATED: { bg: "#e0f2fe", color: "#0369a1" },
  VALIDATED: { bg: "#f0fdf4", color: "#15803d" },
  APPROVED: { bg: "#dcfce7", color: "#166534" },
  PARTIALLY_APPROVED: { bg: "#fef9c3", color: "#854d0e" },
  REJECTED: { bg: "#fee2e2", color: "#b91c1c" },
  CANCELLED: { bg: "#f1f5f9", color: "#475569" },
  PICKING_REQUESTED: { bg: "#ede9fe", color: "#6d28d9" },
  PACKED: { bg: "#fce7f3", color: "#be185d" },
  DISPATCHED: { bg: "#ffedd5", color: "#c2410c" },
  DELIVERED: { bg: "#d1fae5", color: "#065f46" },
};

const formatDate = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function WorkforceOrderAssignmentsPage() {
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, workersRes] = await Promise.all([
        getWorkforceOrders(),
        getAllWorkers(),
      ]);

      // The orders endpoint may return paginated data
      const orderList = ordersRes.data?.content || ordersRes.data || [];
      const workerList = workersRes.data || [];
      setWorkers(workerList);

      // For each order, fetch assigned workers
      const enrichedOrders = await Promise.all(
        orderList.map(async (order) => {
          try {
            const assignRes = await getAssignmentsByOrderId(order.id);
            const assignedWorkerIds = (assignRes.data || []).map(
              (a) => a.workerId
            );
            const assignedWorkerNames = assignedWorkerIds
              .map((wId) => {
                const w = workerList.find((worker) => worker.id === wId);
                return w ? w.name : `ID:${wId}`;
              })
              .join(", ");

            return {
              ...order,
              assignedWorkerCount: assignedWorkerIds.length,
              assignedWorkerNames: assignedWorkerNames || "—",
              supervisorName: order.workerId
                ? workerList.find(
                    (w) => String(w.id) === String(order.workerId)
                  )?.name || `ID:${order.workerId}`
                : "—",
            };
          } catch {
            return {
              ...order,
              assignedWorkerCount: 0,
              assignedWorkerNames: "—",
              supervisorName: order.workerId
                ? workerList.find(
                    (w) => String(w.id) === String(order.workerId)
                  )?.name || `ID:${order.workerId}`
                : "—",
            };
          }
        })
      );

      setOrders(enrichedOrders);
    } catch {
      setToast({
        open: true,
        message: "Failed to load orders",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignClick = (order) => {
    setSelectedOrder(order);
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async (data) => {
    try {
      setSaving(true);
      await assignWorkersToOrder(data);
      setToast({
        open: true,
        message: "Workers assigned to order successfully",
        severity: "success",
      });
      setAssignDialogOpen(false);
      setSelectedOrder(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Assignment failed";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      id: "orderNumber",
      label: "Order #",
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
          {row.orderNumber}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (row) => {
        const sc = statusColor[row.status] || { bg: "#f1f5f9", color: "#475569" };
        return (
          <Chip
            label={row.status}
            size="small"
            sx={{
              bgcolor: sc.bg,
              color: sc.color,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        );
      },
    },
    {
      id: "supervisorName",
      label: "Supervisor",
      sortable: true,
      render: (row) => (
        <Chip
          label={row.supervisorName}
          size="small"
          variant={row.supervisorName === "—" ? "outlined" : "filled"}
          sx={{
            bgcolor: row.supervisorName === "—" ? "transparent" : "#fef3c7",
            color: row.supervisorName === "—" ? "#94a3b8" : "#92400e",
            borderColor: row.supervisorName === "—" ? "#e2e8f0" : "transparent",
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      id: "assignedWorkerNames",
      label: "Assigned Workers",
      sortable: false,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: row.assignedWorkerCount > 0 ? "#1e293b" : "#94a3b8",
              maxWidth: 250,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.assignedWorkerNames}
          </Typography>
          {row.assignedWorkerCount > 0 && (
            <Chip
              label={row.assignedWorkerCount}
              size="small"
              sx={{
                bgcolor: "#ede9fe",
                color: "#6366f1",
                fontWeight: 600,
                minWidth: 24,
                height: 22,
              }}
            />
          )}
        </Box>
      ),
    },
    {
      id: "totalAmount",
      label: "Total",
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {row.totalAmount != null
            ? `$${Number(row.totalAmount).toFixed(2)}`
            : "—"}
        </Typography>
      ),
    },
    {
      id: "createdAt",
      label: "Created",
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {formatDate(row.createdAt)}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<GroupAddIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleAssignClick(row);
          }}
          sx={{
            borderColor: "#6366f1",
            color: "#6366f1",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#ede9fe",
              borderColor: "#4f46e5",
            },
          }}
        >
          Assign
        </Button>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading orders..." />;

  return (
    <Box>
      <PageHeader
        title="Order Worker Assignments"
        subtitle="Assign supervisors and workers to orders. Supervisors are synced to the Order service."
        icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
        backHref="/workforce_service"
        count={orders.length}
      />

      <DataTable
        columns={columns}
        rows={orders}
        searchKeys={["orderNumber", "status", "supervisorName", "assignedWorkerNames"]}
        emptyComponent={
          <EmptyState
            icon={<AssignmentIcon />}
            message="No orders found."
          />
        }
      />

      {selectedOrder && (
        <WorkforceOrderAssignDialog
          open={assignDialogOpen}
          onClose={() => {
            setAssignDialogOpen(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleAssignSubmit}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.orderNumber}
          workers={workers}
          loading={saving}
        />
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
