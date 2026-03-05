"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    TextField,
    Typography,
    Snackbar,
    Alert,
    CircularProgress,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import api from "@/lib/axios";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import BlockIcon from "@mui/icons-material/Block";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

import {
    getCustomerById,
    updateCustomer,
    deactivateCustomer,
} from "@/services/customer_service/customerApi";

const CUSTOMER_STATUS_MAP = {
    ACTIVE: { color: "success", label: "Active" },
    INACTIVE: { color: "default", label: "Inactive" },
};

const getCustomerChip = (status) => {
    const s = (status ?? "").toUpperCase();
    return CUSTOMER_STATUS_MAP[s] ?? { color: "default", label: status ?? "Unknown" };
};

export default function CustomerDetailView({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Form State
    const [form, setForm] = useState({
        customerName: "",
        email: "",
        phone: "",
    });
    const [addresses, setAddresses] = useState([]);

    // Toast
    const [toast, setToast] = useState({ open: false, severity: "info", msg: "" });
    const showToast = (severity, msg) => setToast({ open: true, severity, msg });

    const fetchCustomer = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getCustomerById(id);
            if (data) {
                setCustomer(data);
                setForm({
                    customerName: data.customerName || "",
                    email: data.email || "",
                    phone: data.phone || "",
                });
                setAddresses(data.addresses || []);
            }
        } catch (err) {
            console.error("Failed to load customer details:", err);
            showToast("error", "Failed to load customer details. They might not exist.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    const fetchOrders = useCallback(async (cId) => {
        setLoadingOrders(true);
        try {
            const { data } = await api.get("/api/v1/orders?size=1000");
            if (data && data.content) {
                const customerOrders = data.content.filter(o => o.customerId === cId);
                // Sort by createdAt descending
                customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(customerOrders);
            }
        } catch (err) {
            console.error("Failed to load orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    useEffect(() => {
        if (customer && customer.customerId) {
            fetchOrders(customer.customerId);
        }
    }, [customer?.customerId, fetchOrders]);

    const handleChange = (field, val) => {
        setForm((prev) => ({ ...prev, [field]: val }));
    };

    const handleAddressChange = (idx, field, val) => {
        setAddresses((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: val };
            return copy;
        });
    };

    const handleAddAddress = () => {
        setAddresses((prev) => [
            ...prev,
            {
                type: "BILLING",
                line1: "",
                line2: "",
                city: "",
                district: "",
                postalCode: "",
                country: "USA",
            },
        ]);
    };

    const handleRemoveAddress = (idx) => {
        setAddresses((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (!form.customerName.trim() || !form.email.trim()) {
            showToast("warning", "Customer Name and Email are required.");
            return;
        }

        const validAddresses = addresses.filter((a) => a.line1.trim() && a.city.trim());
        if (validAddresses.length === 0) {
            showToast("warning", "At least one valid address (Line 1 & City) is required.");
            return;
        }

        setSubmitting(true);
        try {
            await updateCustomer(id, {
                customerName: form.customerName,
                email: form.email,
                phone: form.phone,
                addresses: validAddresses,
            });
            showToast("success", "Customer updated successfully!");
            setEditing(false);
            fetchCustomer();
        } catch (err) {
            console.error("Update failed:", err);
            showToast("error", "Failed to update customer.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async () => {
        if (customer?.status === "INACTIVE") return;
        if (!window.confirm("Are you sure you want to deactivate this customer?")) return;
        try {
            await deactivateCustomer(id);
            showToast("success", "Customer deactivated successfully!");
            fetchCustomer();
        } catch (err) {
            console.error("Deactivate failed:", err);
            showToast("error", "Failed to deactivate customer.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!customer) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                    Customer not found or failed to load.
                </Typography>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push("/customer_service")} sx={{ mt: 2 }}>
                    Back to Customers
                </Button>
            </Box>
        );
    }

    const { color, label } = getCustomerChip(customer.status);

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton onClick={() => router.push("/customer_service")} sx={{ bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                            <AssignmentIndIcon sx={{ fontSize: 28, color: "#6366f1" }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                {customer.customerName}
                            </Typography>
                            <Chip label={label} color={color} size="small" sx={{ fontWeight: 600, letterSpacing: "0.5px" }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 1 }}>
                            <span style={{ fontFamily: "monospace", bgcolor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                                ID: {customer.customerId}
                            </span>
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                    {!editing ? (
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setEditing(true)}
                            sx={{ borderColor: "divider", color: "#6366f1", textTransform: "none", fontWeight: 600 }}
                        >
                            Edit Details
                        </Button>
                    ) : (
                        <>
                            <Button onClick={() => { setEditing(false); fetchCustomer(); }} disabled={submitting} sx={{ color: "#64748b", textTransform: "none" }}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={submitting}
                                sx={{ bgcolor: "#6366f1", fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "#4f46e5" } }}
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    )}

                    {customer.status !== "INACTIVE" && (
                        <Button
                            variant="outlined"
                            startIcon={<BlockIcon />}
                            onClick={handleDeactivate}
                            sx={{ borderColor: "#ef4444", color: "#ef4444", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#fef2f2" } }}
                        >
                            Deactivate
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Grid Layout */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 3 }}>
                {/* Left Column (Basic Info) */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b", mb: 2, borderBottom: "1px solid #f1f5f9", pb: 1 }}>
                            Contact Information
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                            <TextField
                                label="Customer Name"
                                value={form.customerName}
                                onChange={(e) => handleChange("customerName", e.target.value)}
                                size="small"
                                fullWidth
                                disabled={!editing}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                size="small"
                                fullWidth
                                disabled={!editing}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Phone"
                                value={form.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                size="small"
                                fullWidth
                                disabled={!editing}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Paper>
                </Box>

                {/* Right Column (Addresses) */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, borderBottom: "1px solid #f1f5f9", pb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                Addresses ({addresses.length})
                            </Typography>
                            {editing && (
                                <Button startIcon={<AddIcon />} onClick={handleAddAddress} size="small" sx={{ textTransform: "none", color: "#6366f1" }}>
                                    Add Address
                                </Button>
                            )}
                        </Box>

                        {addresses.length === 0 && (
                            <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>No addresses found.</Typography>
                        )}

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {addresses.map((addr, idx) => (
                                <Box key={addr.addressId || idx} sx={{ p: 2, border: "1px solid #f1f5f9", borderRadius: 2, bgcolor: editing ? "#fff" : "#f8fafc" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569" }}>
                                            Address {idx + 1}
                                        </Typography>
                                        {editing && (
                                            <IconButton size="small" onClick={() => handleRemoveAddress(idx)} disabled={addresses.length === 1} sx={{ color: "#ef4444" }}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                            <FormControl size="small" sx={{ minWidth: 140 }} disabled={!editing}>
                                                <InputLabel>Type</InputLabel>
                                                <Select value={addr.type || "BILLING"} label="Type" onChange={(e) => handleAddressChange(idx, "type", e.target.value)}>
                                                    <MenuItem value="BILLING">Billing</MenuItem>
                                                    <MenuItem value="SHIPPING">Shipping</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <TextField label="Line 1" value={addr.line1 || ""} onChange={(e) => handleAddressChange(idx, "line1", e.target.value)} size="small" sx={{ flex: 1, minWidth: 200 }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                            <TextField label="Line 2" value={addr.line2 || ""} onChange={(e) => handleAddressChange(idx, "line2", e.target.value)} size="small" sx={{ flex: 1, minWidth: 150 }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                            <TextField label="City" value={addr.city || ""} onChange={(e) => handleAddressChange(idx, "city", e.target.value)} size="small" sx={{ flex: 1, minWidth: 120 }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                            <TextField label="District" value={addr.district || ""} onChange={(e) => handleAddressChange(idx, "district", e.target.value)} size="small" sx={{ flex: 1, minWidth: 120 }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                            <TextField label="Postal Code" value={addr.postalCode || ""} onChange={(e) => handleAddressChange(idx, "postalCode", e.target.value)} size="small" sx={{ flex: 1, minWidth: 100 }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                            <TextField label="Country" value={addr.country || "USA"} onChange={(e) => handleAddressChange(idx, "country", e.target.value)} size="small" sx={{ flex: 1, minWidth: 100 }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* Orders Section */}
            <Box sx={{ mt: 4 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, borderBottom: "1px solid #f1f5f9", pb: 2 }}>
                        <ShoppingCartIcon sx={{ color: "#6366f1" }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                            Customer Orders
                        </Typography>
                    </Box>

                    {loadingOrders ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : orders.length === 0 ? (
                        <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic", textAlign: "center", py: 2 }}>
                            No orders found for this customer.
                        </Typography>
                    ) : (
                        <TableContainer sx={{ border: "1px solid #f1f5f9", borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Order Number</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Total Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Created Date</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, color: "#475569" }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                            <TableCell sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                                                {order.orderNumber}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={order.status?.replace(/_/g, " ")} 
                                                    size="small" 
                                                    sx={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.5px" }} 
                                                    color={
                                                        order.status === "DELIVERED" || order.status === "APPROVED" ? "success" : 
                                                        order.status === "CANCELLED" || order.status === "REJECTED" ? "error" : 
                                                        order.status === "CREATED" ? "default" : "primary"
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>${order.totalAmount?.toFixed(2) || "0.00"}</TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="View Order Details">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => router.push(`/order_service/${order.id}`)}
                                                        sx={{ color: "#6366f1", "&:hover": { bgcolor: "#EEF2FF" } }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>

            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>{toast.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
