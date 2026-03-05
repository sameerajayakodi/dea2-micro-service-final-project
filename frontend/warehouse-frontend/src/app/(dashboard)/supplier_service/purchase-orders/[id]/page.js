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
    Stepper,
    Step,
    StepLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import InventoryIcon from "@mui/icons-material/Inventory";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import {
    getPurchaseOrderById,
    submitPurchaseOrder,
    approvePurchaseOrder,
    sendPurchaseOrder,
    cancelPurchaseOrder,
    receiveGoodsAgainstPO,
} from "@/services/supplier_service/supplierApi";

/* ── Status helpers ─────────────────────────────────────────── */
const PO_STATUS_COLOR = {
    DRAFT: "default",
    SUBMITTED: "info",
    APPROVED: "warning",
    SENT: "primary",
    RECEIVED: "success",
    CANCELLED: "error",
};
const chipColor = (s) => PO_STATUS_COLOR[(s ?? "").toUpperCase()] ?? "default";

/* Steps in the PO lifecycle */
const LIFECYCLE_STEPS = ["DRAFT", "SUBMITTED", "APPROVED", "SENT", "RECEIVED"];

const getActiveStep = (status) => {
    const idx = LIFECYCLE_STEPS.indexOf((status ?? "").toUpperCase());
    return idx >= 0 ? idx : 0;
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT — /supplier_service/purchase-orders/[id]
   ═══════════════════════════════════════════════════════════════ */
export default function PurchaseOrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const poId = params.id;

    const [po, setPO] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Receive goods modal ──
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [receiveItems, setReceiveItems] = useState([{ productId: "", quantityReceived: 0 }]);
    const [receiving, setReceiving] = useState(false);

    // ── Toast ──
    const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });
    const showToast = (severity, msg) => setToast({ open: true, severity, msg });

    /* ── Fetcher ────────────────────────────────────────────── */
    const loadPO = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getPurchaseOrderById(poId);
            setPO(data);
        } catch (err) {
            console.error("Failed to fetch purchase order:", err);
            showToast("error", "Failed to load purchase order");
        } finally {
            setLoading(false);
        }
    }, [poId]);

    useEffect(() => {
        if (poId) loadPO();
    }, [poId, loadPO]);

    /* ── Action handlers ─────────────────────────────────────── */
    const handleSubmit = async () => {
        try {
            await submitPurchaseOrder(poId);
            showToast("success", "Purchase order submitted");
            loadPO();
        } catch { showToast("error", "Submit failed"); }
    };

    const handleApprove = async () => {
        try {
            await approvePurchaseOrder(poId);
            showToast("success", "Purchase order approved");
            loadPO();
        } catch { showToast("error", "Approval failed"); }
    };

    const handleSend = async () => {
        try {
            await sendPurchaseOrder(poId);
            showToast("success", "Purchase order sent to supplier");
            loadPO();
        } catch { showToast("error", "Send failed"); }
    };

    const handleCancel = async () => {
        try {
            await cancelPurchaseOrder(poId);
            showToast("success", "Purchase order cancelled");
            loadPO();
        } catch { showToast("error", "Cancel failed"); }
    };

    /* ── Receive goods helpers ───────────────────────────────── */
    const openReceive = () => {
        if (!po?.items) return;
        setReceiveItems(
            po.items.map((i) => ({
                productId: i.productId,
                quantityReceived: i.quantity ?? 0,
            }))
        );
        setReceiveOpen(true);
    };

    const handleReceiveItemChange = (idx, field, val) => {
        setReceiveItems((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: val };
            return copy;
        });
    };

    const handleReceiveGoods = async () => {
        const poNumber = po?.poNumber || po?.id;
        if (!poNumber) {
            showToast("error", "PO number/ID not found");
            return;
        }
        setReceiving(true);
        try {
            await receiveGoodsAgainstPO(poNumber, {
                receivedItems: receiveItems.map((i) => ({
                    productId: i.productId,
                    quantityReceived: Number(i.quantityReceived),
                })),
            });
            setReceiveOpen(false);
            showToast("success", "Goods received successfully");
            loadPO();
        } catch (err) {
            console.error("Receive failed:", err);
            showToast("error", "Failed to receive goods");
        } finally {
            setReceiving(false);
        }
    };

    /* ── Loading / Not found ─────────────────────────────────── */
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#6366f1" }} />
            </Box>
        );
    }

    if (!po) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ color: "#1e293b" }}>Purchase Order not found</Typography>
                <Button onClick={() => router.push("/supplier_service")} sx={{ mt: 2, color: "#6366f1" }}>
                    ← Back to Supplier Management
                </Button>
            </Box>
        );
    }

    const status = (po.status ?? "").toUpperCase();
    const isCancelled = status === "CANCELLED";
    const isReceived = status === "RECEIVED";

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */
    return (
        <Box>
            {/* ── Top bar ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <IconButton
                    onClick={() => router.push("/supplier_service")}
                    sx={{ color: "#64748b", "&:hover": { color: "#1e293b", bgcolor: "#f1f5f9" } }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Purchase Order Details
                </Typography>
                <Chip
                    label={po.status}
                    color={chipColor(po.status)}
                    sx={{ fontWeight: 600, textTransform: "uppercase", ml: 1 }}
                />
            </Box>

            {/* ── Lifecycle Stepper ── */}
            {!isCancelled && (
                <Paper
                    elevation={0}
                    sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
                >
                    <Stepper activeStep={getActiveStep(status)} alternativeLabel>
                        {LIFECYCLE_STEPS.map((step) => (
                            <Step key={step} completed={LIFECYCLE_STEPS.indexOf(step) < getActiveStep(status)}>
                                <StepLabel
                                    sx={{
                                        "& .MuiStepLabel-label": {
                                            fontWeight: 600,
                                            fontSize: "0.75rem",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                        },
                                        "& .MuiStepIcon-root.Mui-active": { color: "#6366f1" },
                                        "& .MuiStepIcon-root.Mui-completed": { color: "#6366f1" },
                                    }}
                                >
                                    {step}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Paper>
            )}

            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                {/* ═══════ LEFT COLUMN ═══════ */}
                <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* ── Summary card ── */}
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <DescriptionIcon sx={{ color: "#6366f1", fontSize: 24 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                    Summary
                                </Typography>
                            </Box>
                            {po.totalAmount !== undefined && (
                                <Typography variant="h5" sx={{ fontWeight: 800, color: "#6366f1" }}>
                                    ${Number(po.totalAmount ?? 0).toFixed(2)}
                                </Typography>
                            )}
                        </Box>

                        <Grid container spacing={2.5}>
                            {[
                                { label: "PO Number", value: po.poNumber || po.id, mono: true },
                                { label: "Supplier ID", value: po.supplierId || "N/A", mono: true },
                                { label: "Status", value: po.status || "—" },
                                { label: "Expected Delivery", value: po.expectedDeliveryDate ? dayjs(po.expectedDeliveryDate).format("MMM D, YYYY") : "—" },
                                { label: "Created At", value: po.createdAt ? dayjs(po.createdAt).format("MMM D, YYYY h:mm A") : "—" },
                                { label: "Updated At", value: po.updatedAt ? dayjs(po.updatedAt).format("MMM D, YYYY h:mm A") : "—" },
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
                            {status === "DRAFT" && (
                                <>
                                    <Button
                                        variant="contained"
                                        startIcon={<SendIcon />}
                                        onClick={handleSubmit}
                                        sx={{
                                            bgcolor: "#6366f1",
                                            fontWeight: 600,
                                            textTransform: "none",
                                            "&:hover": { bgcolor: "#4f46e5" },
                                        }}
                                    >
                                        Submit PO
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancel}
                                        sx={{ fontWeight: 600, textTransform: "none" }}
                                    >
                                        Cancel PO
                                    </Button>
                                </>
                            )}
                            {status === "SUBMITTED" && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<CheckCircleOutlineIcon />}
                                        onClick={handleApprove}
                                        sx={{ fontWeight: 600, textTransform: "none" }}
                                    >
                                        Approve PO
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancel}
                                        sx={{ fontWeight: 600, textTransform: "none" }}
                                    >
                                        Cancel PO
                                    </Button>
                                </>
                            )}
                            {status === "APPROVED" && (
                                <>
                                    <Button
                                        variant="contained"
                                        startIcon={<LocalShippingIcon />}
                                        onClick={handleSend}
                                        sx={{
                                            bgcolor: "#6366f1",
                                            fontWeight: 600,
                                            textTransform: "none",
                                            "&:hover": { bgcolor: "#4f46e5" },
                                        }}
                                    >
                                        Send to Supplier
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancel}
                                        sx={{ fontWeight: 600, textTransform: "none" }}
                                    >
                                        Cancel PO
                                    </Button>
                                </>
                            )}
                            {status === "SENT" && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<InventoryIcon />}
                                    onClick={openReceive}
                                    sx={{ fontWeight: 600, textTransform: "none" }}
                                >
                                    Receive Goods
                                </Button>
                            )}
                            {(isCancelled || isReceived) && (
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
                                Items ({po.items?.length ?? 0})
                            </Typography>
                        </Box>

                        {po.items?.length > 0 ? (
                            po.items.map((item, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 2,
                                        borderBottom: idx < po.items.length - 1 ? "1px solid" : "none",
                                        borderColor: "divider",
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b", fontFamily: "monospace", fontSize: "0.85rem" }}>
                                            {item.productId}
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 3, mt: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                                                Quantity:{" "}
                                                <Typography component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                    {item.quantity ?? "—"}
                                                </Typography>
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                                                Unit Price:{" "}
                                                <Typography component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                    ${Number(item.unitPrice ?? 0).toFixed(2)}
                                                </Typography>
                                            </Typography>
                                            {item.quantityReceived !== undefined && item.quantityReceived !== null && (
                                                <Typography variant="body2" sx={{ color: "#64748b" }}>
                                                    Received:{" "}
                                                    <Typography component="span" sx={{ fontWeight: 600, color: "#16a34a" }}>
                                                        {item.quantityReceived}
                                                    </Typography>
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: "#6366f1" }}>
                                        ${((item.quantity ?? 0) * (item.unitPrice ?? 0)).toFixed(2)}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                No items in this purchase order.
                            </Typography>
                        )}
                    </Paper>
                </Box>

                {/* ═══════ RIGHT COLUMN — Quick Info ═══════ */}
                <Box sx={{ flex: 1, minWidth: 280 }}>
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
                            Order Lifecycle
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {LIFECYCLE_STEPS.map((step, idx) => {
                                const activeIdx = getActiveStep(status);
                                const isCompleted = idx < activeIdx;
                                const isCurrent = idx === activeIdx;
                                return (
                                    <Box
                                        key={step}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: isCurrent
                                                ? "rgba(99,102,241,0.08)"
                                                : isCompleted
                                                    ? "rgba(34,197,94,0.06)"
                                                    : "transparent",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: "50%",
                                                bgcolor: isCurrent
                                                    ? "#6366f1"
                                                    : isCompleted
                                                        ? "#22c55e"
                                                        : "#cbd5e1",
                                                boxShadow: isCurrent ? "0 0 0 4px rgba(99,102,241,0.2)" : "none",
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400,
                                                color: isCurrent
                                                    ? "#6366f1"
                                                    : isCompleted
                                                        ? "#16a34a"
                                                        : "#94a3b8",
                                                textTransform: "uppercase",
                                                fontSize: "0.75rem",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            {step}
                                        </Typography>
                                        {isCompleted && (
                                            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#22c55e", ml: "auto" }} />
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>

                        {isCancelled && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(239,68,68,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                }}
                            >
                                <CancelIcon sx={{ color: "#ef4444" }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#ef4444" }}>
                                    This PO has been cancelled
                                </Typography>
                            </Box>
                        )}

                        {/* Quick summary stats */}
                        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                            <Typography variant="overline" sx={{ color: "#94a3b8", display: "block", mb: 1 }}>
                                Quick Stats
                            </Typography>
                            {[
                                { label: "Total Items", value: po.items?.length ?? 0 },
                                { label: "Total Quantity", value: po.items?.reduce((sum, i) => sum + (i.quantity ?? 0), 0) ?? 0 },
                                { label: "Total Amount", value: `$${Number(po.totalAmount ?? po.items?.reduce((sum, i) => sum + (i.quantity ?? 0) * (i.unitPrice ?? 0), 0) ?? 0).toFixed(2)}` },
                            ].map((stat) => (
                                <Box key={stat.label} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* ══════════════════════════════════════════════════════
          RECEIVE GOODS DIALOG
          ══════════════════════════════════════════════════════ */}
            <Dialog
                open={receiveOpen}
                onClose={() => setReceiveOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Receive Goods
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    {receiveItems.map((item, idx) => (
                        <Box key={idx} sx={{ display: "flex", gap: 2, mb: 2, mt: idx === 0 ? 1 : 0 }}>
                            <TextField
                                label="Product ID"
                                value={item.productId}
                                onChange={(e) => handleReceiveItemChange(idx, "productId", e.target.value)}
                                size="small"
                                sx={{ flex: 2 }}
                            />
                            <TextField
                                label="Qty Received"
                                type="number"
                                value={item.quantityReceived}
                                onChange={(e) => handleReceiveItemChange(idx, "quantityReceived", e.target.value)}
                                size="small"
                                sx={{ width: 130 }}
                                inputProps={{ min: 0 }}
                            />
                            <IconButton
                                onClick={() =>
                                    receiveItems.length > 1 &&
                                    setReceiveItems((p) => p.filter((_, i) => i !== idx))
                                }
                                disabled={receiveItems.length === 1}
                                sx={{ color: "#ef4444", "&.Mui-disabled": { color: "#cbd5e1" } }}
                            >
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() =>
                            setReceiveItems((p) => [...p, { productId: "", quantityReceived: 0 }])
                        }
                        sx={{ color: "#6366f1", textTransform: "none" }}
                    >
                        Add Item
                    </Button>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button onClick={() => setReceiveOpen(false)} sx={{ color: "#64748b", textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReceiveGoods}
                        variant="contained"
                        disabled={receiving}
                        sx={{
                            bgcolor: "#6366f1",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": { bgcolor: "#4f46e5" },
                        }}
                    >
                        {receiving ? "Receiving…" : "Confirm Receipt"}
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
