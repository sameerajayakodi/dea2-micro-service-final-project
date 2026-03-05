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
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockIcon from "@mui/icons-material/Block";

import {
  getAllCustomers,
  createCustomer,
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

export default function CustomerServicePage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create Customer Form
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
  });
  const [addresses, setAddresses] = useState([
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

  // Toast
  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });
  const showToast = (severity, msg) => setToast({ open: true, severity, msg });

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllCustomers();
      // Data format: array
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load customers:", err);
      showToast("error", "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle Form Change
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
        type: "SHIPPING",
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

  // Submit
  const handleCreateCustomer = async () => {
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
      await createCustomer({
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        addresses: validAddresses,
      });
      showToast("success", "Customer created successfully!");
      resetDialog();
      fetchCustomers();
    } catch (err) {
      console.error("Customer creation failed:", err);
      showToast("error", "Failed to create customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setForm({ customerName: "", email: "", phone: "" });
    setAddresses([
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

  const handleDeactivate = async (id, status) => {
    if (status === "INACTIVE") return;
    if (!window.confirm("Are you sure you want to deactivate this customer?")) return;
    try {
      await deactivateCustomer(id);
      showToast("success", "Customer deactivated.");
      fetchCustomers();
    } catch (err) {
      console.error("Deactivate failed:", err);
      showToast("error", "Failed to deactivate customer.");
    }
  };

  const columns = [
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography
          variant="body2"
          onClick={() => router.push(`/customer_service/${params.row.customerId}`)}
          sx={{
            cursor: "pointer",
            color: "#6366f1",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline", color: "#4f46e5" },
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "phone", headerName: "Phone", flex: 0.8, minWidth: 130 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      minWidth: 120,
      renderCell: (params) => {
        const { color, label } = getCustomerChip(params.value);
        return <Chip label={label} color={color} size="small" sx={{ fontWeight: 600 }} />;
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => router.push(`/customer_service/${params.row.customerId}`)}
            sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeactivate(params.row.customerId, params.row.status)}
            disabled={params.row.status === "INACTIVE"}
            sx={{
              color: params.row.status === "INACTIVE" ? "#cbd5e1" : "#ef4444",
              "&:hover": { color: "#dc2626" },
            }}
            title="Deactivate Customer"
          >
            <BlockIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PeopleIcon sx={{ fontSize: 32, color: "#6366f1" }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Customer Management
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchCustomers}
              sx={{ borderColor: "divider", color: "#64748b", textTransform: "none" }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: "#6366f1",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              New Customer
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Manage customer profiles, addresses, and statuses across the platform.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          height: 600,
          width: "100%",
          borderRadius: 3,
          border: "1px solid divider",
          "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc", color: "#64748b", fontWeight: 600 },
        }}
      >
        <DataGrid
          rows={customers}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.customerId}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* CREATE DIALOG */}
      <Dialog open={dialogOpen} onClose={resetDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ borderBottom: "1px solid divider", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Register Customer
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Customer Name"
                value={form.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              fullWidth
              size="small"
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ height: 1, flex: 1, bgcolor: "#e2e8f0" }} />
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                Addresses
              </Typography>
              <Box sx={{ height: 1, flex: 1, bgcolor: "#e2e8f0" }} />
            </Box>

            {addresses.map((addr, idx) => (
              <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, border: "1px solid #f1f5f9", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Address #{idx + 1}</Typography>
                  <IconButton size="small" onClick={() => handleRemoveAddress(idx)} disabled={addresses.length === 1} sx={{ color: "#ef4444" }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl size="small" sx={{ width: 140 }}>
                    <InputLabel>Type</InputLabel>
                    <Select value={addr.type} label="Type" onChange={(e) => handleAddressChange(idx, "type", e.target.value)}>
                      <MenuItem value="BILLING">Billing</MenuItem>
                      <MenuItem value="SHIPPING">Shipping</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField label="Line 1" value={addr.line1} onChange={(e) => handleAddressChange(idx, "line1", e.target.value)} size="small" fullWidth required />
                  <TextField label="Line 2" value={addr.line2} onChange={(e) => handleAddressChange(idx, "line2", e.target.value)} size="small" fullWidth />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField label="City" value={addr.city} onChange={(e) => handleAddressChange(idx, "city", e.target.value)} size="small" fullWidth required />
                  <TextField label="District" value={addr.district} onChange={(e) => handleAddressChange(idx, "district", e.target.value)} size="small" fullWidth />
                  <TextField label="Postal Code" value={addr.postalCode} onChange={(e) => handleAddressChange(idx, "postalCode", e.target.value)} size="small" fullWidth />
                  <TextField label="Country" value={addr.country} onChange={(e) => handleAddressChange(idx, "country", e.target.value)} size="small" fullWidth />
                </Box>
              </Box>
            ))}

            <Button startIcon={<AddIcon />} onClick={handleAddAddress} sx={{ textTransform: "none", alignSelf: "flex-start", color: "#6366f1" }}>
              Add Another Address
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid divider" }}>
          <Button onClick={resetDialog} sx={{ color: "#64748b", textTransform: "none" }}>Cancel</Button>
          <Button
            onClick={handleCreateCustomer}
            variant="contained"
            disabled={submitting}
            sx={{ bgcolor: "#6366f1", fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            {submitting ? "Registering..." : "Register Customer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
