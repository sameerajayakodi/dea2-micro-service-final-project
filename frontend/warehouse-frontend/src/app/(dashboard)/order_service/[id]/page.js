"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import InventoryIcon from "@mui/icons-material/Inventory";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import dayjs from "dayjs";

import {
  getOrderById,
  getOrderHistory,
  validateOrder,
  approveOrder,
  updateOrderStatus,
  modifyOrder,
} from "@/services/orders/ordersApi";

/* ── Status helpers ─────────────────────────────────────────── */
const STATUS_COLOR = {
  CREATED:           "info",
  VALIDATED:         "warning",
  APPROVED:          "success",
  REJECTED:          "error",
  CANCELLED:         "default",
  PICKING_REQUESTED: "secondary",
};
const chipColor = (s) => STATUS_COLOR[(s ?? "").toUpperCase()] ?? "default";

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT — /order_service/[id]
   ═══════════════════════════════════════════════════════════════ */
export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder]     = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Modify-modal state ──
  const [modifyOpen, setModifyOpen] = useState(false);
  const [editItems, setEditItems]  = useState([]);
  const [saving, setSaving]        = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });
  const showToast = (severity, msg) => setToast({ open: true, severity, msg });

  /* ── Fetchers ────────────────────────────────────────────── */
  const loadOrder = useCallback(async () => {
    try {
      const { data } = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Failed to fetch order:", err);
    }
  }, [orderId]);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await getOrderHistory(orderId);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, [orderId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadOrder(), loadHistory()]);
    setLoading(false);
  }, [loadOrder, loadHistory]);

  useEffect(() => {
    if (orderId) loadAll();
  }, [orderId, loadAll]);

  /* ── Action handlers ─────────────────────────────────────── */
  const handleValidate = async () => {
    try {
      await validateOrder(orderId);
      showToast("success", "Order validated");
      loadAll();
    } catch { showToast("error", "Validation failed"); }
  };

  const handleApprove = async () => {
    try {
      await approveOrder(orderId, { approvalType: "AUTO" });
      showToast("success", "Order approved");
      loadAll();
    } catch { showToast("error", "Approval failed"); }
  };

  const handleRequestPicking = async () => {
    try {
      await updateOrderStatus(orderId, { status: "PICKING_REQUESTED" });
      showToast("success", "Picking requested");
      loadAll();
    } catch { showToast("error", "Request picking failed"); }
  };

  /* ── Modify modal helpers ────────────────────────────────── */
  const openModify = () => {
    if (!order?.items) return;
    setEditItems(
      order.items.map((i) => ({
        itemId: i.itemId,
        quantity: i.requestedQty ?? i.quantity ?? 0,
        unitPrice: i.unitPrice ?? 0,
      }))
    );
    setModifyOpen(true);
  };

  const handleModifySave = async () => {
    setSaving(true);
    try {
      await modifyOrder(orderId, {
        items: editItems.map((i) => ({
          itemId: i.itemId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      });
      setModifyOpen(false);
      showToast("success", "Order modified");
      loadAll();
    } catch { showToast("error", "Modify failed"); }
    finally { setSaving(false); }
  };

  const changeEditItem = (idx, field, val) => {
    setEditItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  /* ── Loading / Not found ─────────────────────────────────── */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ color: "#1e293b" }}>Order not found</Typography>
        <Button onClick={() => router.push("/order_service")} sx={{ mt: 2, color: "#6366f1" }}>
          ← Back to Orders
        </Button>
      </Box>
    );
  }

  const status = (order.status ?? "").toUpperCase();

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <Box>
      {/* ── Top bar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton
          onClick={() => router.push("/order_service")}
          sx={{ color: "#64748b", "&:hover": { color: "#1e293b", bgcolor: "#f1f5f9" } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Order Details
        </Typography>
        <Chip
          label={order.status}
          color={chipColor(order.status)}
          sx={{ fontWeight: 600, textTransform: "uppercase", ml: 1 }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
        {/* ═══════ LEFT COLUMN ═══════ */}
        <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* ── Summary card ── */}
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                Summary
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#6366f1" }}>
                ${Number(order.totalAmount ?? 0).toFixed(2)}
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {[
                { label: "Order Number", value: order.orderNumber || order.id, mono: true },
                { label: "Customer ID",  value: order.customerId || "N/A" },
                { label: "Created At",   value: dayjs(order.createdAt).format("MMM D, YYYY h:mm A") },
                { label: "Partial",      value: order.partialAllowed ? "Yes" : "No" },
                { label: "Worker ID",    value: order.workerId || "Unassigned" },
              ].map((f) => (
                <Grid size={{ xs: 6, sm: 4 }} key={f.label}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.3 }}>
                    {f.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#1e293b",
                      fontWeight: 500,
                      fontFamily: f.mono ? "monospace" : "inherit",
                      wordBreak: "break-all",
                    }}
                  >
                    {f.value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* ── Action bar ── */}
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "#f8fafc" }}
          >
            <Typography variant="overline" sx={{ color: "#94a3b8", mb: 1.5, display: "block" }}>
              Available Actions
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {status === "CREATED" && (
                <>
                  <Button variant="contained" color="warning" startIcon={<FactCheckIcon />} onClick={handleValidate} sx={{ fontWeight: 600, textTransform: "none" }}>
                    Validate Order
                  </Button>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={openModify} sx={{ fontWeight: 600, textTransform: "none", borderColor: "#6366f1", color: "#6366f1" }}>
                    Modify Items
                  </Button>
                </>
              )}
              {status === "VALIDATED" && (
                <Button variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={handleApprove} sx={{ fontWeight: 600, textTransform: "none" }}>
                  Auto Approve
                </Button>
              )}
              {status === "APPROVED" && (
                <Button variant="contained" startIcon={<LocalShippingIcon />} onClick={handleRequestPicking} sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" }, fontWeight: 600, textTransform: "none" }}>
                  Request Picking
                </Button>
              )}
              {!["CREATED", "VALIDATED", "APPROVED"].includes(status) && (
                <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                  No actions available for current status.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* ── Items list ── */}
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <InventoryIcon sx={{ color: "#6366f1", fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                Items ({order.items?.length ?? 0})
              </Typography>
            </Box>

            {order.items?.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 2,
                  borderBottom: idx < order.items.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {item.itemId}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Requested:{" "}
                      <Typography component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {item.requestedQty ?? item.quantity ?? "—"}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Approved:{" "}
                      <Typography component="span" sx={{ fontWeight: 600, color: status !== "CREATED" ? "#16a34a" : "#94a3b8" }}>
                        {item.approvedQty ?? "—"}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Rate:{" "}
                      <Typography component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        ${Number(item.unitPrice ?? 0).toFixed(2)}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#6366f1" }}>
                  ${((item.requestedQty ?? item.quantity ?? 0) * (item.unitPrice ?? 0)).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Box>

        {/* ═══════ RIGHT COLUMN — TIMELINE ═══════ */}
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
              Status Timeline
            </Typography>

            {history.length > 0 ? (
              <Timeline
                sx={{
                  p: 0,
                  m: 0,
                  "& .MuiTimelineOppositeContent-root": { flex: 0.3, minWidth: 60 },
                }}
              >
                {history.map((evt, idx) => (
                  <TimelineItem key={evt.id ?? idx}>
                    <TimelineOppositeContent sx={{ color: "#94a3b8", fontSize: "0.72rem", pt: 1.8 }}>
                      {dayjs(evt.changedAt).format("MMM D")}
                      <br />
                      {dayjs(evt.changedAt).format("HH:mm")}
                    </TimelineOppositeContent>

                    <TimelineSeparator>
                      <TimelineDot
                        sx={{
                          bgcolor: idx === 0 ? "#6366f1" : "#cbd5e1",
                          boxShadow: idx === 0 ? "0 0 0 4px rgba(99,102,241,0.2)" : "none",
                        }}
                      />
                      {idx < history.length - 1 && (
                        <TimelineConnector sx={{ bgcolor: "#e2e8f0" }} />
                      )}
                    </TimelineSeparator>

                    <TimelineContent sx={{ pb: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {evt.previousStatus || "—"}{" "}
                        <span style={{ color: "#94a3b8" }}>→</span>{" "}
                        <span style={{ color: "#6366f1" }}>{evt.newStatus}</span>
                      </Typography>
                      {evt.reason && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b", display: "block", fontStyle: "italic", mt: 0.3 }}
                        >
                          &ldquo;{evt.reason}&rdquo;
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                No history recorded yet.
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════
          MODIFY ITEMS DIALOG
          ══════════════════════════════════════════════════════ */}
      <Dialog
        open={modifyOpen}
        onClose={() => setModifyOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Modify Order Items
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {editItems.map((item, idx) => (
            <Box key={idx} sx={{ display: "flex", gap: 2, mb: 2, mt: idx === 0 ? 1 : 0 }}>
              <TextField
                label="Item ID"
                value={item.itemId}
                onChange={(e) => changeEditItem(idx, "itemId", e.target.value)}
                size="small"
                sx={{ flex: 2 }}
              />
              <TextField
                label="Qty"
                type="number"
                value={item.quantity}
                onChange={(e) => changeEditItem(idx, "quantity", e.target.value)}
                size="small"
                sx={{ width: 90 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Price"
                type="number"
                value={item.unitPrice}
                onChange={(e) => changeEditItem(idx, "unitPrice", e.target.value)}
                size="small"
                sx={{ width: 100 }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <IconButton
                onClick={() => editItems.length > 1 && setEditItems((p) => p.filter((_, i) => i !== idx))}
                disabled={editItems.length === 1}
                sx={{ color: "#ef4444", "&.Mui-disabled": { color: "#cbd5e1" } }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() => setEditItems((p) => [...p, { itemId: "", quantity: 1, unitPrice: 0 }])}
            sx={{ color: "#6366f1", textTransform: "none" }}
          >
            Add Item
          </Button>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={() => setModifyOpen(false)} sx={{ color: "#64748b", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleModifySave}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: "#6366f1", fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            {saving ? "Saving…" : "Save Changes"}
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
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
