"use client";

import { useEffect, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";

const STATUS_OPTIONS = ["PENDING", "IN_TRANSIT", "DELIVERED", "DELAYED"];

const defaultForm = {
    orderId: "",
    vehicleId: "",
    driverId: "",
    status: "PENDING",
    routeDetails: "",
    deliveryNotes: "",
};

export default function DispatchFormDialog({
    open,
    onClose,
    onSubmit,
    dispatch = null,
    loading = false,
}) {
    const [form, setForm] = useState(defaultForm);

    useEffect(() => {
        if (dispatch) {
            setForm({
                orderId: dispatch.orderId || "",
                vehicleId: dispatch.vehicleId || "",
                driverId: dispatch.driverId || "",
                status: dispatch.status || "PENDING",
                routeDetails: dispatch.routeDetails || "",
                deliveryNotes: dispatch.deliveryNotes || "",
            });
        } else {
            setForm(defaultForm);
        }
    }, [dispatch, open]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const isEdit = Boolean(dispatch);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    {isEdit ? "Edit Dispatch" : "Create Dispatch"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            label="Order ID"
                            name="orderId"
                            value={form.orderId}
                            onChange={handleChange}
                            required
                            fullWidth
                            size="small"
                            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                        />
                        <TextField
                            label="Vehicle ID"
                            name="vehicleId"
                            value={form.vehicleId}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="e.g. 223e4567-e89b-12d3-a456-426614174001"
                        />
                        <TextField
                            label="Driver ID"
                            name="driverId"
                            value={form.driverId}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="e.g. 323e4567-e89b-12d3-a456-426614174002"
                        />
                        <TextField
                            label="Status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            select
                            fullWidth
                            size="small"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s.replace("_", " ")}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Route Details"
                            name="routeDetails"
                            value={form.routeDetails}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            multiline
                            minRows={2}
                            placeholder="e.g. Route 66 to Downtown"
                        />
                        <TextField
                            label="Delivery Notes"
                            name="deliveryNotes"
                            value={form.deliveryNotes}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            multiline
                            minRows={2}
                            placeholder="e.g. Deliver between 9 AM and 5 PM"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={onClose}
                        disabled={loading}
                        sx={{ color: "#64748b" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !form.orderId.trim()}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                        sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
                    >
                        {isEdit ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
