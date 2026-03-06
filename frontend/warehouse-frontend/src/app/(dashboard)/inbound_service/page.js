"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InventoryIcon from "@mui/icons-material/Inventory";
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import {
  getInboundShipments,
  getAllReceipts,
  getAllReceiptItems,
  getShipmentById,
  updateShipmentStatus,
  deleteShipment,
} from "@/services/inbound_service/inboundApi";

import ReceiveShipmentModal from "@/components/services/inbound_service/ReceiveShipmentModal";

/* ── Status → Chip color mapping ────────────────────────── */
const STATUS_MAP = {
  PENDING:   { color: "warning", label: "Pending" },
  RECEIVED:  { color: "info",    label: "Received" },
  COMPLETED: { color: "success", label: "Completed" },
  REJECTED:  { color: "error",   label: "Rejected" },
};

const getStatusChip = (status) => {
  const s = (status ?? "").toUpperCase();
  return STATUS_MAP[s] ?? { color: "default", label: status ?? "Unknown" };
};

const QUALITY_MAP = {
  GOOD:     { color: "success", label: "Good" },
  DAMAGED:  { color: "error",   label: "Damaged" },
  PENDING:  { color: "warning", label: "Pending" },
};

const getQualityChip = (status) => {
  const s = (status ?? "").toUpperCase();
  return QUALITY_MAP[s] ?? { color: "default", label: status ?? "Pending" };
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function InboundServicePage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Data state per tab ──
  const [shipments, setShipments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [receiptItems, setReceiptItems] = useState([]);

  // ── Loading state per tab ──
  const [shipmentsLoading, setShipmentsLoading] = useState(true);
  const [receiptsLoading, setReceiptsLoading] = useState(true);
  const [receiptItemsLoading, setReceiptItemsLoading] = useState(true);

  // ── Details dialog ──
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // ── Toast ──
  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });
  const showToast = (severity, msg) => setToast({ open: true, severity, msg });

  /* ── Fetchers ──────────────────────────────────────────── */
  const fetchShipments = useCallback(async () => {
    setShipmentsLoading(true);
    try {
      const { data } = await getInboundShipments();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.shipments) ? data.shipments : Array.isArray(data?.content) ? data.content : [];
      setShipments(rows);
    } catch (err) {
      console.error("Failed to fetch shipments:", err);
      showToast("error", "Failed to load shipments");
    } finally {
      setShipmentsLoading(false);
    }
  }, []);

  const fetchReceipts = useCallback(async () => {
    setReceiptsLoading(true);
    try {
      const { data } = await getAllReceipts();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.receipts) ? data.receipts : Array.isArray(data?.content) ? data.content : [];
      setReceipts(rows);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
      showToast("error", "Failed to load receipts");
    } finally {
      setReceiptsLoading(false);
    }
  }, []);

  const fetchReceiptItems = useCallback(async () => {
    setReceiptItemsLoading(true);
    try {
      const { data } = await getAllReceiptItems();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.content) ? data.content : [];
      setReceiptItems(rows);
    } catch (err) {
      console.error("Failed to fetch receipt items:", err);
      showToast("error", "Failed to load receipt items");
    } finally {
      setReceiptItemsLoading(false);
    }
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    fetchShipments();
    fetchReceipts();
    fetchReceiptItems();
  }, [fetchShipments, fetchReceipts, fetchReceiptItems]);

  const handleRefresh = () => {
    if (tabValue === 0) fetchShipments();
    else if (tabValue === 1) fetchReceipts();
    else fetchReceiptItems();
  };

  const handleRefreshAll = () => {
    fetchShipments();
    fetchReceipts();
    fetchReceiptItems();
  };

  /* ── Status change ─────────────────────────────────────── */
  const handleStatusChange = async (id, currentStatus) => {
    let nextStatus = "COMPLETED";
    if (currentStatus === "PENDING") nextStatus = "RECEIVED";
    else if (currentStatus === "RECEIVED") nextStatus = "COMPLETED";

    try {
      await updateShipmentStatus(id, nextStatus);
      showToast("success", `Shipment status updated to ${nextStatus}`);
      fetchShipments();

      if (selectedShipment?.id === id) {
        const res = await getShipmentById(id);
        setSelectedShipment(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update shipment status");
    }
  };

  /* ── Delete ────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this inbound record?");
    if (!confirmed) return;

    try {
      await deleteShipment(id);
      showToast("success", "Shipment deleted successfully");
      fetchShipments();

      if (selectedShipment?.id === id) {
        setDetailsOpen(false);
        setSelectedShipment(null);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete shipment");
    }
  };

  /* ── View details ──────────────────────────────────────── */
  const handleView = async (id) => {
    try {
      setDetailsLoading(true);
      setDetailsOpen(true);
      const res = await getShipmentById(id);
      setSelectedShipment(res.data);
    } catch (err) {
      console.error(err);
      setSelectedShipment(null);
      showToast("error", "Failed to load shipment details");
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ── Shipment DataGrid columns ─────────────────────────── */
  const shipmentColumns = [
    {
      field: "supplierName",
      headerName: "Supplier",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "#1e293b" }}
        >
          {params.value || "—"}
        </Typography>
      ),
    },
    {
      field: "productName",
      headerName: "Product",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "quantity",
      headerName: "Qty",
      flex: 0.4,
      minWidth: 80,
      type: "number",
      align: "right",
      headerAlign: "right",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      minWidth: 120,
      renderCell: (params) => {
        const { color, label } = getStatusChip(params.value);
        return (
          <Chip
            label={label}
            color={color}
            size="small"
            sx={{ fontWeight: 600, letterSpacing: "0.3px" }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <IconButton
            size="small"
            onClick={() => handleView(params.row.id)}
            sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            onClick={() => handleStatusChange(params.row.id, params.row.status)}
            disabled={params.row.status === "COMPLETED"}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              minWidth: 0,
              px: 1,
              color: "#6366f1",
            }}
          >
            Update
          </Button>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  /* ── Receipt DataGrid columns ──────────────────────────── */
  const receiptColumns = [
    {
      field: "grnNumber",
      headerName: "GRN Number",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) => value || row?.receiptNumber || "—",
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ color: "#6366f1", fontWeight: 600, fontFamily: "monospace" }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "receiptDate",
      headerName: "Date",
      flex: 0.8,
      minWidth: 140,
      valueGetter: (value, row) => {
        const d = value || row?.receivedAt;
        return d ? new Date(d).toLocaleDateString() : "—";
      },
    },
    {
      field: "supplierName",
      headerName: "Supplier",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      minWidth: 120,
      renderCell: (params) => {
        const { color, label } = getStatusChip(params.value);
        return (
          <Chip
            label={label}
            color={color}
            size="small"
            sx={{ fontWeight: 600, letterSpacing: "0.3px" }}
          />
        );
      },
    },
  ];

  /* ── Receipt Items DataGrid columns ────────────────────── */
  const receiptItemColumns = [
    {
      field: "id",
      headerName: "Item ID",
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#64748b" }}>
          #{String(params.value).substring(0, 12)}
        </Typography>
      ),
    },
    {
      field: "productName",
      headerName: "Product Name",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) => value || `ID: ${row?.productId ?? "—"}`,
    },
    {
      field: "quantityReceived",
      headerName: "Qty Received",
      flex: 0.5,
      minWidth: 110,
      type: "number",
      align: "right",
      headerAlign: "right",
    },
    {
      field: "qualityStatus",
      headerName: "Quality",
      flex: 0.5,
      minWidth: 120,
      valueGetter: (value, row) => value || row?.condition || "PENDING",
      renderCell: (params) => {
        const { color, label } = getQualityChip(params.value);
        return (
          <Chip
            label={label}
            color={color}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
  ];

  /* ── Current tab data & columns ────────────────────────── */
  const tabConfig = [
    { data: shipments, columns: shipmentColumns, loading: shipmentsLoading },
    { data: receipts, columns: receiptColumns, loading: receiptsLoading },
    { data: receiptItems, columns: receiptItemColumns, loading: receiptItemsLoading },
  ];

  const current = tabConfig[tabValue];

  /* ─── RENDER ──────────────────────────────────────────── */
  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MoveToInboxIcon sx={{ fontSize: 32, color: "#6366f1" }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Inbound Service
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAll}
              sx={{
                borderColor: "divider",
                color: "#64748b",
                textTransform: "none",
                "&:hover": { borderColor: "#6366f1", color: "#6366f1" },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{
                bgcolor: "#6366f1",
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              New Inbound
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Manage inbound shipments, track goods receipts, and inspect received items.
        </Typography>
      </Box>

      {/* ── Tabs ── */}
      <Tabs
        value={tabValue}
        onChange={(_, val) => setTabValue(val)}
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": { bgcolor: "#6366f1" },
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
          "& .Mui-selected": { color: "#6366f1" },
        }}
      >
        <Tab icon={<MoveToInboxIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Shipments" />
        <Tab icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Receipts (GRNs)" />
        <Tab icon={<InventoryIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Receipt Items" />
      </Tabs>

      {/* ── DataGrid ── */}
      <Paper
        elevation={0}
        sx={{
          height: 620,
          width: "100%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          "& .MuiDataGrid-root":            { border: "none" },
          "& .MuiDataGrid-columnHeaders":   { bgcolor: "#f8fafc", color: "#64748b", fontWeight: 600 },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.3px" },
          "& .MuiDataGrid-columnHeader":    { px: 2.5, py: 1.5 },
          "& .MuiDataGrid-columnSeparator": { color: "#e2e8f0" },
          "& .MuiDataGrid-cell":            { borderColor: "#f1f5f9", px: 2.5, py: 1.5, display: "flex", alignItems: "center" },
          "& .MuiDataGrid-row":             { "&:hover": { bgcolor: "#f8fafc" } },
          "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #f1f5f9", px: 2, py: 0.5 },
          "& .MuiDataGrid-overlay":         { bgcolor: "rgba(255,255,255,0.8)" },
        }}
      >
        <DataGrid
          rows={current.data}
          columns={current.columns}
          loading={current.loading}
          getRowId={(row) => row.id}
          rowHeight={60}
          columnHeaderHeight={52}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* ── Receive Shipment Modal ── */}
      <ReceiveShipmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={handleRefreshAll}
      />

      {/* ── Shipment Details Dialog ── */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          Shipment Details
        </DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#6366f1" }} />
            </Box>
          ) : !selectedShipment ? (
            <Typography sx={{ py: 2, color: "#64748b" }}>No data found.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              {[
                { label: "ID", value: selectedShipment.id },
                { label: "Supplier", value: selectedShipment.supplierName },
                { label: "Product", value: selectedShipment.productName },
                { label: "Quantity", value: selectedShipment.quantity },
                { label: "SKU", value: selectedShipment.sku },
              ].map(({ label, value }) => value != null && (
                <Box key={label} sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748b", minWidth: 90 }}>
                    {label}:
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1e293b" }}>
                    {value}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748b", minWidth: 90 }}>
                  Status:
                </Typography>
                {(() => {
                  const { color, label } = getStatusChip(selectedShipment.status);
                  return <Chip label={label} color={color} size="small" sx={{ fontWeight: 600 }} />;
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          {selectedShipment && (
            <>
              <Button
                onClick={() => handleStatusChange(selectedShipment.id, selectedShipment.status)}
                disabled={selectedShipment.status === "COMPLETED"}
                sx={{ textTransform: "none", color: "#6366f1", fontWeight: 600 }}
              >
                Update Status
              </Button>
              <Button
                color="error"
                onClick={() => handleDelete(selectedShipment.id)}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Delete
              </Button>
            </>
          )}
          <Button
            onClick={() => setDetailsOpen(false)}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}