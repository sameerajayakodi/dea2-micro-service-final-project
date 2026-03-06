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
    Avatar,
    Fade,
    Divider,
    Skeleton,
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
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HomeIcon from "@mui/icons-material/Home";

import {
    getCustomerById,
    updateCustomer,
    deactivateCustomer,
} from "@/services/customer_service/customerApi";

const CUSTOMER_STATUS_MAP = {
    ACTIVE: { color: "success", label: "Active", icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
    INACTIVE: { color: "default", label: "Inactive", icon: <CancelIcon sx={{ fontSize: 14 }} /> },
};

const getCustomerChip = (status) => {
    const s = (status ?? "").toUpperCase();
    return CUSTOMER_STATUS_MAP[s] ?? { color: "default", label: status ?? "Unknown" };
};

const getInitials = (name) => {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

const avatarColors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
];

const getAvatarColor = (name) => {
    if (!name) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
};

const ORDER_STATUS_STYLES = {
    DELIVERED: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    APPROVED: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    CANCELLED: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    REJECTED: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    CREATED: { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
    PENDING: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
};

const getOrderStatusStyle = (status) => {
    return ORDER_STATUS_STYLES[status] || { color: "#6366f1", bg: "#EEF2FF", border: "#c7d2fe" };
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

        const validAddresses = addresses.filter(
            (a) => a.line1?.trim() && a.city?.trim() && a.district?.trim() && a.postalCode?.trim() && a.country?.trim()
        );
        if (validAddresses.length === 0) {
            showToast("warning", "At least one complete address (Line 1, City, District, Postal Code & Country) is required.");
            return;
        }

        setSubmitting(true);
        try {
            // Strip addressId from each address since the backend AddressRequest DTO doesn't accept it
            const cleanedAddresses = validAddresses.map(({ addressId, ...rest }) => rest);
            await updateCustomer(id, {
                customerName: form.customerName,
                email: form.email,
                phone: form.phone,
                addresses: cleanedAddresses,
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
            <Box>
                {/* Skeleton Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box>
                        <Skeleton width={200} height={32} />
                        <Skeleton width={300} height={20} sx={{ mt: 0.5 }} />
                    </Box>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 3 }}>
                    <Skeleton variant="rounded" height={250} sx={{ borderRadius: 3 }} />
                    <Skeleton variant="rounded" height={250} sx={{ borderRadius: 3 }} />
                </Box>
            </Box>
        );
    }

    if (!customer) {
        return (
            <Box sx={{ textAlign: "center", py: 12 }}>
                <PersonIcon sx={{ fontSize: 72, color: "#e2e8f0", mb: 2 }} />
                <Typography variant="h5" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                    Customer not found
                </Typography>
                <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 3 }}>
                    The customer may have been removed or the ID is invalid.
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push("/customer_service")}
                    sx={{
                        borderColor: "#e2e8f0",
                        color: "#6366f1",
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2.5,
                        "&:hover": { borderColor: "#6366f1", bgcolor: "#EEF2FF" },
                    }}
                >
                    Back to Customers
                </Button>
            </Box>
        );
    }

    const { color, label } = getCustomerChip(customer.status);

    return (
        <Box>
            {/* Header */}
            <Fade in timeout={400}>
                <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-start", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Tooltip title="Back to Customers" arrow>
                            <IconButton
                                onClick={() => router.push("/customer_service")}
                                sx={{
                                    bgcolor: "#f1f5f9",
                                    width: 42,
                                    height: 42,
                                    "&:hover": { bgcolor: "#e2e8f0", transform: "translateX(-2px)" },
                                    transition: "all 0.2s",
                                }}
                            >
                                <ArrowBackIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>

                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                background: getAvatarColor(customer.customerName),
                                fontWeight: 700,
                                fontSize: "1.2rem",
                                letterSpacing: "0.5px",
                                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                            }}
                        >
                            {getInitials(customer.customerName)}
                        </Avatar>

                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                    {customer.customerName}
                                </Typography>
                                <Chip
                                    label={label}
                                    color={color}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        letterSpacing: "0.5px",
                                        fontSize: "0.7rem",
                                        borderRadius: 2,
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "#94a3b8" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <FingerprintIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                        {customer.customerId}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        {!editing ? (
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => setEditing(true)}
                                sx={{
                                    borderColor: "#e2e8f0",
                                    color: "#6366f1",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 2.5,
                                    "&:hover": { borderColor: "#6366f1", bgcolor: "#EEF2FF" },
                                }}
                            >
                                Edit Details
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => { setEditing(false); fetchCustomer(); }}
                                    disabled={submitting}
                                    sx={{
                                        color: "#64748b",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: 2.5,
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={submitting}
                                    sx={{
                                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                        fontWeight: 600,
                                        textTransform: "none",
                                        borderRadius: 2.5,
                                        boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                        },
                                    }}
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
                                sx={{
                                    borderColor: "#fecaca",
                                    color: "#ef4444",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 2.5,
                                    "&:hover": { bgcolor: "#fef2f2", borderColor: "#ef4444" },
                                }}
                            >
                                Deactivate
                            </Button>
                        )}
                    </Box>
                </Box>
            </Fade>

            {/* Grid Layout */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 3 }}>
                {/* Left Column (Basic Info) */}
                <Fade in timeout={500}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: editing ? "#c7d2fe" : "#f1f5f9",
                                transition: "all 0.3s ease",
                                ...(editing && {
                                    boxShadow: "0 0 0 3px rgba(99,102,241,0.08)",
                                }),
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                                <PersonIcon sx={{ fontSize: 20, color: "#6366f1" }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                    Contact Information
                                </Typography>
                                {editing && (
                                    <Chip
                                        label="EDITING"
                                        size="small"
                                        sx={{
                                            ml: "auto",
                                            fontSize: "0.65rem",
                                            fontWeight: 700,
                                            bgcolor: "#EEF2FF",
                                            color: "#6366f1",
                                            letterSpacing: "0.5px",
                                            borderRadius: 1.5,
                                        }}
                                    />
                                )}
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                <TextField
                                    label="Customer Name"
                                    value={form.customerName}
                                    onChange={(e) => handleChange("customerName", e.target.value)}
                                    size="small"
                                    fullWidth
                                    disabled={!editing}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2.5,
                                            ...(!editing && { bgcolor: "#f8fafc" }),
                                        },
                                    }}
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
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2.5,
                                            ...(!editing && { bgcolor: "#f8fafc" }),
                                        },
                                    }}
                                />
                                <TextField
                                    label="Phone"
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    size="small"
                                    fullWidth
                                    disabled={!editing}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2.5,
                                            ...(!editing && { bgcolor: "#f8fafc" }),
                                        },
                                    }}
                                />
                            </Box>
                        </Paper>

                        {/* Quick Info Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "#f1f5f9",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                                <ReceiptIcon sx={{ fontSize: 20, color: "#6366f1" }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                    Quick Summary
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>Total Orders</Typography>
                                    <Chip
                                        label={loadingOrders ? "..." : orders.length}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: "#EEF2FF",
                                            color: "#6366f1",
                                            fontSize: "0.8rem",
                                            borderRadius: 1.5,
                                        }}
                                    />
                                </Box>
                                <Divider />
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>Addresses</Typography>
                                    <Chip
                                        label={addresses.length}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: "#F0FDF4",
                                            color: "#16a34a",
                                            fontSize: "0.8rem",
                                            borderRadius: 1.5,
                                        }}
                                    />
                                </Box>
                                <Divider />
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>Status</Typography>
                                    <Chip
                                        label={label}
                                        color={color}
                                        size="small"
                                        sx={{ fontWeight: 600, fontSize: "0.7rem", borderRadius: 1.5 }}
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Fade>

                {/* Right Column (Addresses) */}
                <Fade in timeout={600}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: editing ? "#c7d2fe" : "#f1f5f9",
                                transition: "all 0.3s ease",
                                ...(editing && {
                                    boxShadow: "0 0 0 3px rgba(99,102,241,0.08)",
                                }),
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <LocationOnIcon sx={{ fontSize: 20, color: "#6366f1" }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                        Addresses
                                    </Typography>
                                    <Chip
                                        label={addresses.length}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: "#f1f5f9",
                                            color: "#64748b",
                                            fontSize: "0.7rem",
                                            height: 22,
                                            borderRadius: 1.5,
                                        }}
                                    />
                                </Box>
                                {editing && (
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAddress}
                                        size="small"
                                        sx={{
                                            textTransform: "none",
                                            color: "#6366f1",
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            border: "1px dashed #c7d2fe",
                                            "&:hover": { bgcolor: "#EEF2FF", borderColor: "#6366f1" },
                                        }}
                                    >
                                        Add Address
                                    </Button>
                                )}
                            </Box>

                            {addresses.length === 0 && (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <HomeIcon sx={{ fontSize: 48, color: "#e2e8f0", mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                                        No addresses found.
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {addresses.map((addr, idx) => (
                                    <Paper
                                        key={addr.addressId || idx}
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            border: "1px solid",
                                            borderColor: editing ? "#e2e8f0" : "#f1f5f9",
                                            borderRadius: 3,
                                            bgcolor: editing ? "#fff" : "#fafafe",
                                            transition: "all 0.25s ease",
                                            "&:hover": {
                                                borderColor: editing ? "#c7d2fe" : "#e2e8f0",
                                                ...(editing && { boxShadow: "0 2px 8px rgba(99,102,241,0.08)" }),
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: 1.5,
                                                        bgcolor: addr.type === "SHIPPING" ? "#DBEAFE" : "#EEF2FF",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    {addr.type === "SHIPPING" ? (
                                                        <LocalShippingIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
                                                    ) : (
                                                        <ReceiptIcon sx={{ fontSize: 16, color: "#6366f1" }} />
                                                    )}
                                                </Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569" }}>
                                                    {addr.type === "SHIPPING" ? "Shipping" : "Billing"} Address
                                                </Typography>
                                            </Box>
                                            {editing && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveAddress(idx)}
                                                    disabled={addresses.length === 1}
                                                    sx={{
                                                        color: "#ef4444",
                                                        "&:hover": { bgcolor: "#fef2f2" },
                                                    }}
                                                >
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>

                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                <FormControl size="small" sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} disabled={!editing}>
                                                    <InputLabel>Type</InputLabel>
                                                    <Select value={addr.type || "BILLING"} label="Type" onChange={(e) => handleAddressChange(idx, "type", e.target.value)}>
                                                        <MenuItem value="BILLING">Billing</MenuItem>
                                                        <MenuItem value="SHIPPING">Shipping</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <TextField
                                                    label="Line 1"
                                                    value={addr.line1 || ""}
                                                    onChange={(e) => handleAddressChange(idx, "line1", e.target.value)}
                                                    size="small"
                                                    sx={{ flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: 2.5, ...(!editing && { bgcolor: "#f8fafc" }) } }}
                                                    disabled={!editing}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                                <TextField
                                                    label="Line 2"
                                                    value={addr.line2 || ""}
                                                    onChange={(e) => handleAddressChange(idx, "line2", e.target.value)}
                                                    size="small"
                                                    sx={{ flex: 1, minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2.5, ...(!editing && { bgcolor: "#f8fafc" }) } }}
                                                    disabled={!editing}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                <TextField label="City" value={addr.city || ""} onChange={(e) => handleAddressChange(idx, "city", e.target.value)} size="small" sx={{ flex: 1, minWidth: 120, "& .MuiOutlinedInput-root": { borderRadius: 2.5, ...(!editing && { bgcolor: "#f8fafc" }) } }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                                <TextField label="District" value={addr.district || ""} onChange={(e) => handleAddressChange(idx, "district", e.target.value)} size="small" sx={{ flex: 1, minWidth: 120, "& .MuiOutlinedInput-root": { borderRadius: 2.5, ...(!editing && { bgcolor: "#f8fafc" }) } }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                                <TextField label="Postal Code" value={addr.postalCode || ""} onChange={(e) => handleAddressChange(idx, "postalCode", e.target.value)} size="small" sx={{ flex: 1, minWidth: 100, "& .MuiOutlinedInput-root": { borderRadius: 2.5, ...(!editing && { bgcolor: "#f8fafc" }) } }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                                <TextField label="Country" value={addr.country || "USA"} onChange={(e) => handleAddressChange(idx, "country", e.target.value)} size="small" sx={{ flex: 1, minWidth: 100, "& .MuiOutlinedInput-root": { borderRadius: 2.5, ...(!editing && { bgcolor: "#f8fafc" }) } }} disabled={!editing} InputLabelProps={{ shrink: true }} />
                                            </Box>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </Paper>
                    </Box>
                </Fade>
            </Box>

            {/* Orders Section */}
            <Fade in timeout={700}>
                <Box sx={{ mt: 4 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "#f1f5f9" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 2,
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <ShoppingCartIcon sx={{ color: "#fff", fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>
                                    Customer Orders
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                    {orders.length} total order{orders.length !== 1 ? "s" : ""}
                                </Typography>
                            </Box>
                        </Box>

                        {loadingOrders ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: 2 }} />
                                ))}
                            </Box>
                        ) : orders.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 5 }}>
                                <ShoppingCartIcon sx={{ fontSize: 48, color: "#e2e8f0", mb: 1 }} />
                                <Typography variant="body1" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                                    No orders found
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
                                    This customer hasn&apos;t placed any orders yet
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer sx={{ borderRadius: 2.5, border: "1px solid #f1f5f9", overflow: "hidden" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                                            <TableCell sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>
                                                Order Number
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>
                                                Status
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>
                                                Total Amount
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>
                                                Created Date
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orders.map((order) => {
                                            const statusStyle = getOrderStatusStyle(order.status);
                                            return (
                                                <TableRow
                                                    key={order.id}
                                                    onClick={() => router.push(`/order_service/${order.id}`)}
                                                    sx={{
                                                        cursor: "pointer",
                                                        transition: "all 0.15s ease",
                                                        "&:hover": {
                                                            bgcolor: "#fafaff",
                                                            boxShadow: "inset 3px 0 0 #6366f1",
                                                        },
                                                        "&:last-child td, &:last-child th": { border: 0 },
                                                    }}
                                                >
                                                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>
                                                        {order.orderNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={order.status?.replace(/_/g, " ")}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: "0.65rem",
                                                                letterSpacing: "0.5px",
                                                                borderRadius: 1.5,
                                                                bgcolor: statusStyle.bg,
                                                                color: statusStyle.color,
                                                                border: `1px solid ${statusStyle.border}`,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                            ${order.totalAmount?.toFixed(2) || "0.00"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <CalendarTodayIcon sx={{ fontSize: 13, color: "#cbd5e1" }} />
                                                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="View Order Details" arrow>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/order_service/${order.id}`);
                                                                }}
                                                                sx={{
                                                                    color: "#cbd5e1",
                                                                    "&:hover": { color: "#6366f1", bgcolor: "#EEF2FF" },
                                                                    transition: "all 0.2s",
                                                                }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Box>
            </Fade>

            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2.5 }}>
                    {toast.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
