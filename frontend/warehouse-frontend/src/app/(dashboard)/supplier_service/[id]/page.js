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
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import dayjs from "dayjs";
import {
    getSupplierById,
    updateSupplier,
    updateSupplierStatus,
} from "@/services/supplier_service/supplierApi";

/* ── Status helpers ─────────────────────────────────────────── */
const SUPPLIER_STATUS_COLOR = {
    ACTIVE: "success",
    INACTIVE: "default",
};
const chipColor = (s) => SUPPLIER_STATUS_COLOR[(s ?? "").toUpperCase()] ?? "default";

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT — /supplier_service/[id]
   ═══════════════════════════════════════════════════════════════ */
export default function SupplierDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const supplierId = params.id;

    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Edit modal state ──
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
    });
    const [saving, setSaving] = useState(false);

    // ── Toast ──
    const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });
    const showToast = (severity, msg) => setToast({ open: true, severity, msg });

    /* ── Fetcher ────────────────────────────────────────────── */
    const loadSupplier = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getSupplierById(supplierId);
            setSupplier(data);
        } catch (err) {
            console.error("Failed to fetch supplier:", err);
            showToast("error", "Failed to load supplier details");
        } finally {
            setLoading(false);
        }
    }, [supplierId]);

    useEffect(() => {
        if (supplierId) loadSupplier();
    }, [supplierId, loadSupplier]);

    /* ── Action handlers ─────────────────────────────────────── */
    const handleToggleStatus = async () => {
        if (!supplier) return;
        const newStatus = (supplier.status ?? "").toUpperCase() === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        try {
            await updateSupplierStatus(supplierId, { status: newStatus });
            showToast("success", `Supplier set to ${newStatus}`);
            loadSupplier();
        } catch (err) {
            console.error("Status update failed:", err);
            showToast("error", "Failed to update status");
        }
    };

    /* ── Edit modal helpers ──────────────────────────────────── */
    const openEdit = () => {
        if (!supplier) return;
        setEditForm({
            name: supplier.name || "",
            contactPerson: supplier.contactPerson || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
        });
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        if (!editForm.name.trim()) {
            showToast("warning", "Supplier name is required");
            return;
        }
        setSaving(true);
        try {
            await updateSupplier(supplierId, editForm);
            setEditOpen(false);
            showToast("success", "Supplier updated");
            loadSupplier();
        } catch (err) {
            console.error("Update failed:", err);
            showToast("error", "Failed to update supplier");
        } finally {
            setSaving(false);
        }
    };

    const changeEditField = (field, val) => {
        setEditForm((prev) => ({ ...prev, [field]: val }));
    };

    /* ── Loading / Not found ─────────────────────────────────── */
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#6366f1" }} />
            </Box>
        );
    }

    if (!supplier) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ color: "#1e293b" }}>
                    Supplier not found
                </Typography>
                <Button onClick={() => router.push("/supplier_service")} sx={{ mt: 2, color: "#6366f1" }}>
                    ← Back to Suppliers
                </Button>
            </Box>
        );
    }

    const status = (supplier.status ?? "").toUpperCase();
    const isActive = status === "ACTIVE";

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
                    Supplier Details
                </Typography>
                <Chip
                    label={supplier.status}
                    color={chipColor(supplier.status)}
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
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <BusinessIcon sx={{ color: "#6366f1", fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                    {supplier.name}
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={openEdit}
                                sx={{
                                    fontWeight: 600,
                                    textTransform: "none",
                                    borderColor: "#6366f1",
                                    color: "#6366f1",
                                    "&:hover": { bgcolor: "rgba(99,102,241,0.04)" },
                                }}
                            >
                                Edit
                            </Button>
                        </Box>

                        <Grid container spacing={2.5}>
                            {[
                                { label: "Supplier ID", value: supplier.id, mono: true },
                                { label: "Contact Person", value: supplier.contactPerson || "N/A", icon: <PersonIcon sx={{ fontSize: 16, color: "#94a3b8", mr: 0.5 }} /> },
                                { label: "Email", value: supplier.email || "N/A", icon: <EmailIcon sx={{ fontSize: 16, color: "#94a3b8", mr: 0.5 }} /> },
                                { label: "Phone", value: supplier.phone || "N/A", icon: <PhoneIcon sx={{ fontSize: 16, color: "#94a3b8", mr: 0.5 }} /> },
                                { label: "Address", value: supplier.address || "N/A", icon: <LocationOnIcon sx={{ fontSize: 16, color: "#94a3b8", mr: 0.5 }} /> },
                                { label: "Created At", value: supplier.createdAt ? dayjs(supplier.createdAt).format("MMM D, YYYY h:mm A") : "—" },
                                { label: "Updated At", value: supplier.updatedAt ? dayjs(supplier.updatedAt).format("MMM D, YYYY h:mm A") : "—" },
                            ].map((f) => (
                                <Grid size={{ xs: 6, sm: 4 }} key={f.label}>
                                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.3 }}>
                                        {f.label}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        {f.icon}
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
                                    </Box>
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
                            <Button
                                variant="contained"
                                startIcon={isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                                onClick={handleToggleStatus}
                                color={isActive ? "error" : "success"}
                                sx={{ fontWeight: 600, textTransform: "none" }}
                            >
                                {isActive ? "Deactivate Supplier" : "Activate Supplier"}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={openEdit}
                                sx={{
                                    fontWeight: 600,
                                    textTransform: "none",
                                    borderColor: "#6366f1",
                                    color: "#6366f1",
                                }}
                            >
                                Update Details
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* ═══════ RIGHT COLUMN — Contact Card ═══════ */}
                <Box sx={{ flex: 1, minWidth: 280 }}>
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
                            Contact Information
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                            {[
                                { icon: <PersonIcon sx={{ color: "#6366f1" }} />, label: "Contact Person", value: supplier.contactPerson || "N/A" },
                                { icon: <EmailIcon sx={{ color: "#6366f1" }} />, label: "Email", value: supplier.email || "N/A" },
                                { icon: <PhoneIcon sx={{ color: "#6366f1" }} />, label: "Phone", value: supplier.phone || "N/A" },
                                { icon: <LocationOnIcon sx={{ color: "#6366f1" }} />, label: "Address", value: supplier.address || "N/A" },
                            ].map((item) => (
                                <Box key={item.label} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                    {item.icon}
                                    <Box>
                                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                                            {item.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 500 }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        {/* Status indicator */}
                        <Box
                            sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: isActive ? "rgba(34,197,94,0.08)" : "rgba(148,163,184,0.1)",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: isActive ? "#22c55e" : "#94a3b8",
                                    boxShadow: isActive ? "0 0 0 4px rgba(34,197,94,0.2)" : "none",
                                }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: isActive ? "#16a34a" : "#64748b" }}>
                                {isActive ? "This supplier is currently active" : "This supplier is inactive"}
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* ══════════════════════════════════════════════════════
          EDIT SUPPLIER DIALOG
          ══════════════════════════════════════════════════════ */}
            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Edit Supplier Details
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Supplier Name"
                            value={editForm.name}
                            onChange={(e) => changeEditField("name", e.target.value)}
                            size="small"
                            fullWidth
                            required
                        />
                        <TextField
                            label="Contact Person"
                            value={editForm.contactPerson}
                            onChange={(e) => changeEditField("contactPerson", e.target.value)}
                            size="small"
                            fullWidth
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => changeEditField("email", e.target.value)}
                                size="small"
                                fullWidth
                                required
                            />
                            <TextField
                                label="Phone"
                                value={editForm.phone}
                                onChange={(e) => changeEditField("phone", e.target.value)}
                                size="small"
                                fullWidth
                            />
                        </Box>
                        <TextField
                            label="Address"
                            value={editForm.address}
                            onChange={(e) => changeEditField("address", e.target.value)}
                            size="small"
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ color: "#64748b", textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSave}
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
