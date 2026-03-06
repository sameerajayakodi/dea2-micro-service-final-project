"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Autocomplete,
  MenuItem,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import InventoryIcon from "@mui/icons-material/Inventory";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import VerifiedIcon from "@mui/icons-material/Verified";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from "dayjs";

import {
  getOrderById,
  getOrderHistory,
  validateOrder,
  approveOrder,
  updateOrderStatus,
  modifyOrder,
  getProducts,
  getCustomers,
} from "@/services/orders/ordersApi";

/* ── Status helpers ─────────────────────────────────────────── */
const STATUS_COLOR = {
  CREATED:           "info",
  VALIDATED:         "warning",
  APPROVED:          "success",
  REJECTED:          "error",
  CANCELLED:         "default",
  PICKING_REQUESTED: "secondary",
  PACKED:            "info",
  DISPATCHED:        "warning",
  DELIVERED:         "success",
};
const chipColor = (s) => STATUS_COLOR[(s ?? "").toUpperCase()] ?? "default";

/* ── Order lifecycle pipeline ──────────────────────────────── */
const ORDER_PIPELINE = [
  { status: "DELIVERED",         label: "Delivered",         icon: <CheckCircleIcon />,         color: "#059669", bg: "#ecfdf5" },
  { status: "DISPATCHED",        label: "Dispatched",        icon: <LocalShippingIcon />,       color: "#f97316", bg: "#fff7ed" },
  { status: "PACKED",            label: "Packed",            icon: <Inventory2Icon />,          color: "#3b82f6", bg: "#eff6ff" },
  { status: "PICKING_REQUESTED", label: "Picking Requested", icon: <PlaylistAddCheckIcon />,    color: "#8b5cf6", bg: "#f5f3ff" },
  { status: "APPROVED",          label: "Approved",          icon: <ThumbUpAltIcon />,          color: "#10b981", bg: "#ecfdf5" },
  { status: "VALIDATED",         label: "Validated",         icon: <VerifiedIcon />,            color: "#f59e0b", bg: "#fffbeb" },
  { status: "CREATED",           label: "Created",           icon: <NoteAddIcon />,            color: "#6366f1", bg: "#eef2ff" },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT — /order_service/[id]
   ═══════════════════════════════════════════════════════════════ */
export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder]     = useState(null);
  const [history, setHistory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts]   = useState([]);
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

  const loadExtras = useCallback(async () => {
    try {
      const [cRes, pRes] = await Promise.allSettled([getCustomers(), getProducts()]);
      if (cRes.status === "fulfilled") {
        const d = cRes.value.data;
        setCustomers(Array.isArray(d) ? d : Array.isArray(d?.content) ? d.content : []);
      }
      if (pRes.status === "fulfilled") {
        const d = pRes.value.data;
        setProducts(Array.isArray(d) ? d : Array.isArray(d?.content) ? d.content : []);
      }
    } catch (err) {}
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadOrder(), loadHistory(), loadExtras()]);
    setLoading(false);
  }, [loadOrder, loadHistory, loadExtras]);

  useEffect(() => {
    if (orderId) loadAll();
  }, [orderId, loadAll]);

  /* ── Sorted history & status map for timeline ────────────── */
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt)),
    [history]
  );

  const historyByNewStatus = useMemo(() => {
    const map = {};
    sortedHistory.forEach((evt) => { map[evt.newStatus] = evt; });
    return map;
  }, [sortedHistory]);

  /* ── Action handlers ─────────────────────────────────────── */
  const getErrorMessage = (err, fallback) => {
    const dataMsg = err?.response?.data?.message;
    if (dataMsg) {
      try {
        const jsonMatch = dataMsg.match(/\{.*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message) {
            const prefix = dataMsg.split(':')[0];
            return `${prefix}: ${parsed.message}`;
          }
        }
      } catch (e) {}
      return dataMsg;
    }
    return fallback;
  };

  const handleValidate = async () => {
    try {
      await validateOrder(orderId);
      showToast("success", "Order validated");
      loadAll();
    } catch (err) {
      showToast("error", getErrorMessage(err, "Validation failed"));
    }
  };

  const handleApprove = async () => {
    try {
      await approveOrder(orderId, { approvalType: "AUTO" });
      showToast("success", "Order approved");
      loadAll();
    } catch (err) {
      showToast("error", getErrorMessage(err, "Approval failed"));
    }
  };

  const handleRequestPicking = async () => {
    try {
      await updateOrderStatus(orderId, { status: "PICKING_REQUESTED" });
      showToast("success", "Picking requested");
      loadAll();
    } catch (err) {
      showToast("error", getErrorMessage(err, "Request picking failed"));
    }
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
    } catch (err) { showToast("error", getErrorMessage(err, "Modify failed")); }
    finally { setSaving(false); }
  };

  const changeEditItem = (idx, field, val) => {
    setEditItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      
      if (field === "itemId") {
        const selectedProd = products.find((p) => String(p.id) === String(val));
        if (selectedProd && selectedProd.price !== undefined) {
           copy[idx].unitPrice = selectedProd.price;
        }
      }
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

  const cObj = customers.find(x => String(x.customerId || x.id) === String(order.customerId));
  const cName = cObj ? (cObj.customerName || cObj.name || cObj.firstName) : null;
  const customerDisplay = cName ? `${cName} (${order.customerId})` : (order.customerId || "N/A");

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
                { label: "Customer",     value: customerDisplay },
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
              {status === "PICKING_REQUESTED" && (
                <Button variant="contained" startIcon={<Inventory2Icon />} onClick={async () => { try { await updateOrderStatus(orderId, { status: "PACKED" }); showToast("success", "Order packed"); loadAll(); } catch (e) { showToast("error", getErrorMessage(e, "Pack failed")); } }} sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, fontWeight: 600, textTransform: "none" }}>
                  Mark as Packed
                </Button>
              )}
              {status === "PACKED" && (
                <Button variant="contained" startIcon={<LocalShippingIcon />} onClick={async () => { try { await updateOrderStatus(orderId, { status: "DISPATCHED" }); showToast("success", "Order dispatched"); loadAll(); } catch (e) { showToast("error", getErrorMessage(e, "Dispatch failed")); } }} sx={{ bgcolor: "#f97316", "&:hover": { bgcolor: "#ea580c" }, fontWeight: 600, textTransform: "none" }}>
                  Mark as Dispatched
                </Button>
              )}
              {status === "DISPATCHED" && (
                <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={async () => { try { await updateOrderStatus(orderId, { status: "DELIVERED" }); showToast("success", "Order delivered!"); loadAll(); } catch (e) { showToast("error", getErrorMessage(e, "Delivery update failed")); } }} sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" }, fontWeight: 600, textTransform: "none" }}>
                  Mark as Delivered
                </Button>
              )}
              {!["CREATED", "VALIDATED", "APPROVED", "PICKING_REQUESTED", "PACKED", "DISPATCHED"].includes(status) && (
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
                    {(() => {
                      const p = products.find(x => String(x.id) === String(item.itemId));
                      const pName = p?.name;
                      return pName ? `${pName} (${item.itemId})` : item.itemId;
                    })()}
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

        {/* ═══════ RIGHT COLUMN — PREMIUM TIMELINE ═══════ */}
        <Box sx={{ flex: 1, minWidth: 320 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: "#6366f1" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                Order Journey
              </Typography>
            </Box>

            {/* ── Pipeline steps ── */}
            <Box sx={{ position: "relative", pl: 0.5 }}>
              {ORDER_PIPELINE.map((step, idx) => {
                const evt = historyByNewStatus[step.status];
                const isCompleted = !!evt;
                const currentIdx = ORDER_PIPELINE.findIndex(
                  (s) => s.status === (order?.status ?? "").toUpperCase()
                );
                const isCurrent = idx === currentIdx;
                const isPending = !isCompleted && !isCurrent;
                const isLast = idx === ORDER_PIPELINE.length - 1;

                return (
                  <Box key={step.status} sx={{ display: "flex", gap: 0, mb: 0 }}>
                    {/* ── Vertical line + dot ── */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 48 }}>
                      {/* Icon circle */}
                      <Tooltip title={step.label} arrow placement="left">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: isCompleted ? step.color : isCurrent ? step.bg : "#f8fafc",
                            border: "2px solid",
                            borderColor: isCompleted ? step.color : isCurrent ? step.color : "#e2e8f0",
                            color: isCompleted ? "#fff" : isCurrent ? step.color : "#cbd5e1",
                            transition: "all 0.3s ease",
                            position: "relative",
                            zIndex: 2,
                            boxShadow: isCurrent
                              ? `0 0 0 4px ${step.color}22, 0 4px 12px ${step.color}33`
                              : isCompleted
                              ? `0 2px 8px ${step.color}33`
                              : "none",
                            animation: isCurrent ? "pulse-ring 2s ease-in-out infinite" : "none",
                            "@keyframes pulse-ring": {
                              "0%":   { boxShadow: `0 0 0 4px ${step.color}22, 0 4px 12px ${step.color}33` },
                              "50%":  { boxShadow: `0 0 0 8px ${step.color}11, 0 4px 16px ${step.color}44` },
                              "100%": { boxShadow: `0 0 0 4px ${step.color}22, 0 4px 12px ${step.color}33` },
                            },
                            "& svg": { fontSize: 20 },
                          }}
                        >
                          {isCompleted ? <CheckCircleIcon sx={{ fontSize: "20px !important" }} /> : step.icon}
                        </Box>
                      </Tooltip>
                      {/* Connector line */}
                      {!isLast && (
                        <Box
                          sx={{
                            width: 2,
                            flex: 1,
                            minHeight: 32,
                            bgcolor: isCompleted && historyByNewStatus[ORDER_PIPELINE[idx + 1]?.status]
                              ? step.color
                              : "#e2e8f0",
                            transition: "background-color 0.3s ease",
                            background: isCompleted && historyByNewStatus[ORDER_PIPELINE[idx + 1]?.status]
                              ? `linear-gradient(to bottom, ${step.color}, ${ORDER_PIPELINE[idx + 1]?.color || step.color})`
                              : undefined,
                          }}
                        />
                      )}
                    </Box>

                    {/* ── Content ── */}
                    <Box sx={{ flex: 1, pb: isLast ? 0 : 2.5, pt: 0.5, pl: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isCompleted || isCurrent ? 700 : 500,
                          color: isCompleted ? "#1e293b" : isCurrent ? step.color : "#94a3b8",
                          fontSize: isCurrent ? "0.9rem" : "0.85rem",
                          lineHeight: 1.3,
                        }}
                      >
                        {step.label}
                        {isCurrent && (
                          <Chip
                            label="Current"
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              bgcolor: step.bg,
                              color: step.color,
                              border: `1px solid ${step.color}44`,
                            }}
                          />
                        )}
                      </Typography>

                      {/* Timestamp & reason for completed */}
                      {isCompleted && evt && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 0.5 }}>
                            {dayjs(evt.changedAt).format("MMM D, YYYY • h:mm A")}
                          </Typography>
                          {evt.reason && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#94a3b8",
                                display: "block",
                                mt: 0.3,
                                fontStyle: "italic",
                                fontSize: "0.72rem",
                                pl: 0,
                              }}
                            >
                              &ldquo;{evt.reason}&rdquo;
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Pending label */}
                      {isPending && (
                        <Typography variant="caption" sx={{ color: "#cbd5e1", fontSize: "0.72rem" }}>
                          Pending
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
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
              <Autocomplete
                options={products}
                getOptionLabel={(p) => p.name ? `${p.name} - ${p.skuCode || ""}` : `Product ${p.id || item.itemId}`}
                value={products.find(p => String(p.id) === String(item.itemId)) || null}
                onChange={(_, newValue) => changeEditItem(idx, "itemId", newValue ? newValue.id : "")}
                isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                size="small"
                sx={{ flex: 2, minWidth: 200 }}
                ListboxProps={{ style: { maxHeight: 250, overflow: "auto" } }}
                renderInput={(params) => <TextField {...params} label="Product" />}
                noOptionsText={products.length === 0 ? "Loading products..." : "No match"}
                renderOption={(props, option, { selected }) => {
                  const { key, ...otherProps } = props;
                  return (
                    <MenuItem key={key} {...otherProps} sx={{ py: 1, borderBottom: "1px solid #f1f5f9" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>{option.name || `Product ${option.id}`}</Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>SKU: {option.skuCode || "N/A"}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#10b981" }}>${Number(option.price || 0).toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                }}
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
