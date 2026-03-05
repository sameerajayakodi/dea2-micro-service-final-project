"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Paper,
    TextField,
    Typography,
    Snackbar,
    Alert,
    MenuItem,
    Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";
import {
    getAllSuppliers,
    getAllPurchaseOrders,
    createPurchaseOrder,
} from "@/services/supplier_service/supplierApi";

/* ── PO Status → Chip color ───────────────────────────────── */
const PO_STATUS_MAP = {
    DRAFT: { color: "default", label: "Draft" },
    SUBMITTED: { color: "info", label: "Submitted" },
    APPROVED: { color: "warning", label: "Approved" },
    SENT: { color: "primary", label: "Sent" },
    RECEIVED: { color: "success", label: "Received" },
    CANCELLED: { color: "error", label: "Cancelled" },
};

const getPOChip = (status) => {
    const s = (status ?? "").toUpperCase();
    return PO_STATUS_MAP[s] ?? { color: "default", label: status ?? "Unknown" };
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT — /supplier_service/purchase-orders
   ═══════════════════════════════════════════════════════════════ */
export default function PurchaseOrdersPage() {
    const router = useRouter();

    // ── Table state ──
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Suppliers for dropdown ──
    const [suppliers, setSuppliers] = useState([]);

    // ── Create PO dialog ──
    const [dialogOpen, setDialogOpen] = useState(false);
    const [poForm, setPOForm] = useState({ supplierId: "", expectedDeliveryDate: "" });
    const [poItems, setPOItems] = useState([{ productId: "", quantity: 1, unitPrice: 0 }]);
    const [submitting, setSubmitting] = useState(false);

    // ── Toast ──
    const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });
    const showToast = (severity, msg) => setToast({ open: true, severity, msg });

    /* ── Fetchers ──────────────────────────────────────────── */
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getAllPurchaseOrders();
            const rows = Array.isArray(data) ? data : Array.isArray(data?.purchaseOrders) ? data.purchaseOrders : Array.isArray(data?.content) ? data.content : [];
            setPurchaseOrders(rows);
        } catch (err) {
            console.error("Failed to fetch purchase orders:", err);
            showToast("error", "Failed to load purchase orders");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSuppliers = useCallback(async () => {
        try {
            const { data } = await getAllSuppliers();
            const rows = Array.isArray(data) ? data : Array.isArray(data?.suppliers) ? data.suppliers : Array.isArray(data?.content) ? data.content : [];
            setSuppliers(rows);
        } catch (err) {
            console.error("Failed to fetch suppliers:", err);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        fetchSuppliers();
    }, [fetchOrders, fetchSuppliers]);

    /* ── Item helpers ──────────────────────────────────────── */
    const handleItemChange = (idx, field, value) => {
        setPOItems((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: value };
            return copy;
        });
    };
    const handleAddItem = () => setPOItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);
    const handleRemoveItem = (idx) => setPOItems((prev) => prev.filter((_, i) => i !== idx));

    /* ── Create PO ─────────────────────────────────────────── */
    const handleCreatePO = async () => {
        if (!poForm.supplierId) {
            showToast("warning", "Supplier is required");
            return;
        }
        const validItems = poItems
            .filter((i) => i.productId && Number(i.quantity) > 0)
            .map((i) => ({ productId: i.productId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }));
        if (validItems.length === 0) {
            showToast("warning", "Add at least one valid item");
            return;
        }
        setSubmitting(true);
        try {
            await createPurchaseOrder({
                supplierId: poForm.supplierId,
                expectedDeliveryDate: poForm.expectedDeliveryDate
                    ? new Date(poForm.expectedDeliveryDate).toISOString()
                    : undefined,
                items: validItems,
            });
            showToast("success", "Purchase order created!");
            resetDialog();
            fetchOrders();
        } catch (err) {
            console.error("Create PO failed:", err);
            showToast("error", "Failed to create purchase order");
        } finally {
            setSubmitting(false);
        }
    };

    const resetDialog = () => {
        setDialogOpen(false);
        setPOForm({ supplierId: "", expectedDeliveryDate: "" });
        setPOItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
    };

    /* ── DataGrid columns ──────────────────────────────────── */
    const columns = [
        {
            field: "poNumber",
            headerName: "PO #",
            flex: 0.8,
            minWidth: 160,
            renderCell: (params) => (
                <Typography
                    variant="body2"
                    onClick={() => router.push(`/supplier_service/purchase-orders/${params.row.id}`)}
                    sx={{
                        cursor: "pointer",
                        color: "#6366f1",
                        fontFamily: "monospace",
                        fontWeight: 600,
                        "&:hover": { textDecoration: "underline", color: "#4f46e5" },
                    }}
                >
                    {params.value || String(params.row.id).substring(0, 12)}
                </Typography>
            ),
        },
        {
            field: "supplierId",
            headerName: "Supplier ID",
            flex: 0.7,
            minWidth: 140,
            valueGetter: (value) => value ? String(value).substring(0, 12) + "…" : "—",
        },
        {
            field: "expectedDeliveryDate",
            headerName: "Expected Delivery",
            flex: 0.7,
            minWidth: 150,
            valueGetter: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "—"),
        },
        {
            field: "totalAmount",
            headerName: "Total ($)",
            flex: 0.5,
            minWidth: 110,
            type: "number",
            align: "right",
            headerAlign: "right",
            valueFormatter: (value) => `$${Number(value ?? 0).toFixed(2)}`,
        },
        {
            field: "status",
            headerName: "Status",
            flex: 0.6,
            minWidth: 130,
            renderCell: (params) => {
                const { color, label } = getPOChip(params.value);
                return (
                    <Chip label={label} color={color} size="small" sx={{ fontWeight: 600, letterSpacing: "0.3px" }} />
                );
            },
        },
        {
            field: "createdAt",
            headerName: "Created",
            flex: 0.7,
            minWidth: 150,
            valueGetter: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "—"),
        },
        {
            field: "actions",
            headerName: "",
            width: 60,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    onClick={() => router.push(`/supplier_service/purchase-orders/${params.row.id}`)}
                    sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

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
                        <IconButton
                            onClick={() => router.push("/supplier_service")}
                            sx={{ color: "#64748b", "&:hover": { color: "#1e293b", bgcolor: "#f1f5f9" } }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <ShoppingCartCheckoutIcon sx={{ fontSize: 32, color: "#6366f1" }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
                            Purchase Orders
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchOrders}
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
                            onClick={() => setDialogOpen(true)}
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
                            New Purchase Order
                        </Button>
                    </Box>
                </Box>
                <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600, ml: 6 }}>
                    Create and manage purchase orders for your suppliers.
                </Typography>
            </Box>

            {/* ── DataGrid ── */}
            <Paper
                elevation={0}
                sx={{
                    height: 560,
                    width: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc", color: "#64748b", fontWeight: 600 },
                    "& .MuiDataGrid-columnSeparator": { color: "#e2e8f0" },
                    "& .MuiDataGrid-cell": { borderColor: "#f1f5f9" },
                    "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
                    "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #f1f5f9" },
                }}
            >
                <DataGrid
                    rows={purchaseOrders}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
                    }}
                    disableRowSelectionOnClick
                />
            </Paper>

            {/* ══════════════════════════════════════════════════════
          CREATE PURCHASE ORDER DIALOG
          ══════════════════════════════════════════════════════ */}
            <Dialog
                open={dialogOpen}
                onClose={resetDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Create Purchase Order
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                            <Autocomplete
                                options={suppliers}
                                getOptionLabel={(s) => s.name ? `${s.name} (${s.contactPerson || "N/A"})` : `Supplier ${s.id}`}
                                value={suppliers.find((s) => String(s.id) === String(poForm.supplierId)) || null}
                                onChange={(_, newValue) => setPOForm((prev) => ({ ...prev, supplierId: newValue ? newValue.id : "" }))}
                                isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                                size="small"
                                sx={{ flex: 2, minWidth: 250 }}
                                renderInput={(params) => <TextField {...params} label="Supplier" required />}
                                noOptionsText={suppliers.length === 0 ? "Loading or no suppliers…" : "No match"}
                                renderOption={(props, option) => {
                                    const { key, ...otherProps } = props;
                                    return (
                                        <MenuItem key={key} {...otherProps} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", py: 1, borderBottom: "1px solid #f1f5f9" }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                {option.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                                                {option.contactPerson || "—"} · {option.email || "—"}
                                            </Typography>
                                        </MenuItem>
                                    );
                                }}
                            />
                            <TextField
                                label="Expected Delivery Date"
                                type="date"
                                value={poForm.expectedDeliveryDate}
                                onChange={(e) => setPOForm((prev) => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                                size="small"
                                sx={{ flex: 1, minWidth: 180 }}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Box>

                        <SectionDivider text="Order Items" />

                        {poItems.map((item, idx) => (
                            <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <TextField
                                    label="Product ID"
                                    value={item.productId}
                                    onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                                    size="small"
                                    sx={{ flex: 2, minWidth: 200 }}
                                />
                                <TextField
                                    label="Qty"
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                                    size="small"
                                    sx={{ width: 100 }}
                                    inputProps={{ min: 1 }}
                                />
                                <TextField
                                    label="Unit Price"
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                                    size="small"
                                    sx={{ width: 120 }}
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                                <IconButton
                                    onClick={() => handleRemoveItem(idx)}
                                    disabled={poItems.length === 1}
                                    sx={{ color: "#ef4444", "&.Mui-disabled": { color: "#cbd5e1" } }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Box>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddItem}
                            variant="text"
                            sx={{ color: "#6366f1", width: "fit-content", textTransform: "none" }}
                        >
                            Add Another Item
                        </Button>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button onClick={resetDialog} sx={{ color: "#64748b", textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreatePO}
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            bgcolor: "#6366f1",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": { bgcolor: "#4f46e5" },
                        }}
                    >
                        {submitting ? "Creating…" : "Create Purchase Order"}
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

/* ── Tiny helper ───────────────────────────────────────────── */
function SectionDivider({ text }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ height: 1, flex: 1, bgcolor: "#e2e8f0" }} />
            <Typography
                variant="caption"
                sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}
            >
                {text}
            </Typography>
            <Box sx={{ height: 1, flex: 1, bgcolor: "#e2e8f0" }} />
        </Box>
    );
}
