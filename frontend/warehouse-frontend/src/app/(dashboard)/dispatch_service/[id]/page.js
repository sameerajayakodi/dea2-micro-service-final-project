"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RouteIcon from "@mui/icons-material/Route";
import NotesIcon from "@mui/icons-material/Notes";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    Typography,
} from "@mui/material";

import DispatchFormDialog from "@/components/dispatch/DispatchFormDialog";
import {
    LoadingState,
    ConfirmDialog,
    Toast,
} from "@/components/workforce/shared";
import {
    getDispatchById,
    updateDispatch,
    deleteDispatch,
} from "@/services/dispatch";

/* ---------- Status config ---------- */
const statusConfig = {
    PENDING: {
        label: "Pending",
        bgcolor: "#fef3c7",
        color: "#92400e",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        icon: <PendingActionsIcon />,
    },
    IN_TRANSIT: {
        label: "In Transit",
        bgcolor: "#dbeafe",
        color: "#1e40af",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        icon: <LocalShippingOutlinedIcon />,
    },
    DELIVERED: {
        label: "Delivered",
        bgcolor: "#dcfce7",
        color: "#166534",
        gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        icon: <CheckCircleOutlineIcon />,
    },
    DELAYED: {
        label: "Delayed",
        bgcolor: "#fee2e2",
        color: "#991b1b",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        icon: <WarningAmberIcon />,
    },
};

const fmtDate = (dt) => {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function DispatchDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [dispatch, setDispatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const fetchDispatch = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getDispatchById(id);
            setDispatch(res.data);
        } catch {
            setToast({
                open: true,
                message: "Failed to load dispatch details",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDispatch();
    }, [fetchDispatch]);

    const handleEdit = async (data) => {
        try {
            setSaving(true);
            await updateDispatch(id, data);
            setToast({
                open: true,
                message: "Dispatch updated successfully",
                severity: "success",
            });
            setFormOpen(false);
            fetchDispatch();
        } catch (err) {
            const msg = err.response?.data?.message || "Update failed";
            setToast({ open: true, message: msg, severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteDispatch(id);
            setToast({
                open: true,
                message: "Dispatch deleted",
                severity: "success",
            });
            setTimeout(() => router.push("/dispatch_service"), 800);
        } catch (err) {
            const msg = err.response?.data?.message || "Delete failed";
            setToast({ open: true, message: msg, severity: "error" });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <LoadingState message="Loading dispatch details..." />;

    if (!dispatch) {
        return (
            <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography variant="h6" sx={{ color: "#94a3b8" }}>
                    Dispatch not found.
                </Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push("/dispatch_service")}
                    sx={{ mt: 2, color: "#6366f1" }}
                >
                    Back to Dispatches
                </Button>
            </Box>
        );
    }

    const cfg = statusConfig[dispatch.status] || statusConfig.PENDING;

    /* ---------- Detail fields ---------- */
    const details = [
        { label: "Dispatch ID", value: dispatch.id, mono: true },
        { label: "Order ID", value: dispatch.orderId, mono: true },
        { label: "Vehicle ID", value: dispatch.vehicleId || "Not assigned", mono: true },
        { label: "Driver ID", value: dispatch.driverId || "Not assigned", mono: true },
    ];

    return (
        <Box>
            {/* Back button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/dispatch_service")}
                sx={{
                    mb: 2,
                    color: "#64748b",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#f1f5f9" },
                }}
            >
                Back to Dispatches
            </Button>

            {/* Top section: Status hero + actions */}
            <Paper
                elevation={0}
                sx={{
                    p: 0,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    mb: 3,
                }}
            >
                {/* Gradient header bar */}
                <Box
                    sx={{
                        background: cfg.gradient,
                        px: 4,
                        py: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                width: 52,
                                height: 52,
                            }}
                        >
                            <LocalShippingIcon sx={{ color: "#fff", fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ color: "#fff", fontWeight: 700 }}
                            >
                                Dispatch Details
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace" }}
                            >
                                {dispatch.id}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        icon={cfg.icon}
                        label={cfg.label}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            height: 36,
                            backdropFilter: "blur(4px)",
                            "& .MuiChip-icon": { color: "#fff" },
                        }}
                    />
                </Box>

                {/* Content */}
                <Box sx={{ p: 4 }}>
                    {/* Action buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            mb: 3,
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setFormOpen(true)}
                            sx={{
                                borderColor: "#6366f1",
                                color: "#6366f1",
                                "&:hover": { bgcolor: "#ede9fe", borderColor: "#4f46e5" },
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteOpen(true)}
                            sx={{
                                borderColor: "#ef4444",
                                color: "#ef4444",
                                "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                            }}
                        >
                            Delete
                        </Button>
                    </Box>

                    {/* Detail grid */}
                    <Grid container spacing={3}>
                        {details.map((d) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={d.label}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "#94a3b8", fontWeight: 500, mb: 0.5 }}
                                >
                                    {d.label}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 500,
                                        color: "#1e293b",
                                        ...(d.mono && {
                                            fontFamily: "monospace",
                                            fontSize: "0.85rem",
                                        }),
                                        wordBreak: "break-all",
                                    }}
                                >
                                    {d.value}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Route & Notes */}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <RouteIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                                <Typography
                                    variant="subtitle2"
                                    sx={{ color: "#475569", fontWeight: 600 }}
                                >
                                    Route Details
                                </Typography>
                            </Box>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "#f8fafc",
                                    minHeight: 80,
                                }}
                            >
                                <Typography variant="body2" sx={{ color: "#334155", whiteSpace: "pre-wrap" }}>
                                    {dispatch.routeDetails || "No route details provided."}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <NotesIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                                <Typography
                                    variant="subtitle2"
                                    sx={{ color: "#475569", fontWeight: 600 }}
                                >
                                    Delivery Notes
                                </Typography>
                            </Box>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "#f8fafc",
                                    minHeight: 80,
                                }}
                            >
                                <Typography variant="body2" sx={{ color: "#334155", whiteSpace: "pre-wrap" }}>
                                    {dispatch.deliveryNotes || "No delivery notes provided."}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Timestamps */}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <AccessTimeIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                    Created: {fmtDate(dispatch.createdAt)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <AccessTimeIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                    Updated: {fmtDate(dispatch.updatedAt)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Edit Dialog */}
            <DispatchFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleEdit}
                dispatch={dispatch}
                loading={saving}
            />

            {/* Confirm Delete */}
            <ConfirmDialog
                open={deleteOpen}
                title="Delete Dispatch"
                message="Are you sure you want to delete this dispatch? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteOpen(false)}
                loading={deleting}
            />

            {/* Toast */}
            <Toast
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={() => setToast({ ...toast, open: false })}
            />
        </Box>
    );
}
