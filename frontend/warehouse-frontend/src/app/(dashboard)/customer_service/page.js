"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Avatar,
  InputAdornment,
  Fade,
  Skeleton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockIcon from "@mui/icons-material/Block";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GroupIcon from "@mui/icons-material/Group";
import PersonOffIcon from "@mui/icons-material/PersonOff";

import {
  getAllCustomers,
  createCustomer,
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

export default function CustomerServicePage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name_asc");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

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

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSortBy("name_asc");
    setCountryFilter("ALL");
    setCityFilter("ALL");
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

  const handleDeactivate = async (e, id, status) => {
    e.stopPropagation();
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

  // Get unique countries and cities for filters
  const uniqueCountries = Array.from(new Set(customers.flatMap(c => c.addresses?.map(a => a.country).filter(Boolean) || []))).sort();
  const uniqueCities = Array.from(new Set(customers.flatMap(c => c.addresses?.map(a => a.city).filter(Boolean) || []))).sort();

  // Filtered customers
  const filteredAndSortedCustomers = customers
    .filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || c.status?.toUpperCase() === statusFilter;

      const matchesCountry =
        countryFilter === "ALL" || c.addresses?.some(a => a.country === countryFilter);

      const matchesCity =
        cityFilter === "ALL" || c.addresses?.some(a => a.city === cityFilter);

      return matchesSearch && matchesStatus && matchesCountry && matchesCity;
    })
    .sort((a, b) => {
      if (sortBy === "name_asc") return (a.customerName || "").localeCompare(b.customerName || "");
      if (sortBy === "name_desc") return (b.customerName || "").localeCompare(a.customerName || "");
      if (sortBy === "email_asc") return (a.email || "").localeCompare(b.email || "");
      if (sortBy === "email_desc") return (b.email || "").localeCompare(a.email || "");
      return 0;
    });

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status?.toUpperCase() === "ACTIVE").length;
  const inactiveCustomers = customers.filter((c) => c.status?.toUpperCase() === "INACTIVE").length;

  const statCards = [
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: <GroupIcon />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      lightBg: "#EEF2FF",
    },
    {
      label: "Active",
      value: activeCustomers,
      icon: <CheckCircleIcon />,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      lightBg: "#F0FDF4",
    },
    {
      label: "Inactive",
      value: inactiveCustomers,
      icon: <PersonOffIcon />,
      gradient: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
      lightBg: "#FFF7ED",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              }}
            >
              <PeopleIcon sx={{ fontSize: 26, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>
                Customer Management
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.3 }}>
                Manage customer profiles, addresses, and statuses
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchCustomers}
              sx={{
                borderColor: "#e2e8f0",
                color: "#64748b",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2.5,
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2.5,
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                px: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
                },
              }}
            >
              New Customer
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5, mb: 4 }}>
        {statCards.map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "#f1f5f9",
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.25s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: s.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>
                {loading ? "—" : s.value}
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                {s.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Search & Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "#f1f5f9",
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            flex: 1,
            minWidth: 250,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              bgcolor: "#f8fafc",
              "&:hover fieldset": { borderColor: "#c7d2fe" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              borderRadius: 2.5,
              bgcolor: "#f8fafc",
              "& fieldset": { borderColor: "#e2e8f0" },
            }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              borderRadius: 2.5,
              bgcolor: "#f8fafc",
              "& fieldset": { borderColor: "#e2e8f0" },
            }}
          >
            <MenuItem value="name_asc">Name (A-Z)</MenuItem>
            <MenuItem value="name_desc">Name (Z-A)</MenuItem>
            <MenuItem value="email_asc">Email (A-Z)</MenuItem>
            <MenuItem value="email_desc">Email (Z-A)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={countryFilter}
            label="Country"
            onChange={(e) => setCountryFilter(e.target.value)}
            sx={{
              borderRadius: 2.5,
              bgcolor: "#f8fafc",
              "& fieldset": { borderColor: "#e2e8f0" },
            }}
          >
            <MenuItem value="ALL">All Countries</MenuItem>
            {uniqueCountries.map(country => (
              <MenuItem key={country} value={country}>{country}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>City</InputLabel>
          <Select
            value={cityFilter}
            label="City"
            onChange={(e) => setCityFilter(e.target.value)}
            sx={{
              borderRadius: 2.5,
              bgcolor: "#f8fafc",
              "& fieldset": { borderColor: "#e2e8f0" },
            }}
          >
            <MenuItem value="ALL">All Cities</MenuItem>
            {uniqueCities.map(city => (
              <MenuItem key={city} value={city}>{city}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {(searchQuery || statusFilter !== "ALL" || sortBy !== "name_asc" || countryFilter !== "ALL" || cityFilter !== "ALL") && (
          <Button
            size="small"
            onClick={resetFilters}
            sx={{ textTransform: "none", color: "#ef4444", fontWeight: 600 }}
          >
            Clear Filters
          </Button>
        )}

        <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500, ml: "auto" }}>
          Showing {filteredAndSortedCustomers.length} of {totalCustomers} customers
        </Typography>
      </Paper>

      {/* Customer List */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "#f1f5f9",
          overflow: "hidden",
        }}
      >
        {/* List Header */}
        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "2fr 2fr 1.2fr 1fr 80px",
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: "#f8fafc",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Customer
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Email
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Phone
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Status
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>
            Actions
          </Typography>
        </Box>

        {/* Loading Skeletons */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, px: 3, py: 2, borderBottom: "1px solid #f8fafc" }}>
              <Skeleton variant="circular" width={44} height={44} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="30%" height={20} />
                <Skeleton width="50%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          ))}

        {/* Empty State */}
        {!loading && filteredAndSortedCustomers.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <PersonOffIcon sx={{ fontSize: 56, color: "#e2e8f0", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 600 }}>
              {(searchQuery || statusFilter !== "ALL" || countryFilter !== "ALL" || cityFilter !== "ALL") ? "No customers match your filters" : "No customers found"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 0.5 }}>
              {(searchQuery || statusFilter !== "ALL" || countryFilter !== "ALL" || cityFilter !== "ALL") ? "Try adjusting your search criteria" : "Click 'New Customer' to add your first customer"}
            </Typography>
          </Box>
        )}

        {/* Customer Rows */}
        {!loading &&
          filteredAndSortedCustomers.map((customer, index) => {
            const { color, label } = getCustomerChip(customer.status);
            const addressCount = customer.addresses?.length || 0;
            return (
              <Fade in key={customer.customerId} timeout={200 + index * 50}>
                <Box
                  onClick={() => router.push(`/customer_service/${customer.customerId}`)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "2fr 2fr 1.2fr 1fr 80px" },
                    gap: { xs: 1, md: 2 },
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    cursor: "pointer",
                    borderBottom: "1px solid #f8fafc",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#fafaff",
                      boxShadow: "inset 3px 0 0 #6366f1",
                    },
                    "&:last-child": { borderBottom: "none" },
                    "&:active": { bgcolor: "#f1f0ff" },
                  }}
                >
                  {/* Name + Avatar */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        background: getAvatarColor(customer.customerName),
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {getInitials(customer.customerName)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: "#1e293b",
                          lineHeight: 1.3,
                          "&:hover": { color: "#6366f1" },
                        }}
                      >
                        {customer.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 12 }} />
                        {addressCount} address{addressCount !== 1 ? "es" : ""}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Email */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: "#cbd5e1", display: { xs: "inline", md: "none" } }} />
                    <Typography variant="body2" sx={{ color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {customer.email}
                    </Typography>
                  </Box>

                  {/* Phone */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: "#cbd5e1", display: { xs: "inline", md: "none" } }} />
                    <Typography variant="body2" sx={{ color: "#64748b", fontFamily: "monospace" }}>
                      {customer.phone || "—"}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Chip
                    label={label}
                    color={color}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      letterSpacing: "0.5px",
                      borderRadius: 2,
                      justifySelf: "flex-start",
                    }}
                  />

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    {customer.status !== "INACTIVE" && (
                      <Tooltip title="Deactivate Customer" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeactivate(e, customer.customerId, customer.status)}
                          sx={{
                            color: "#cbd5e1",
                            "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
                            transition: "all 0.2s",
                          }}
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/customer_service/${customer.customerId}`);
                      }}
                      sx={{
                        color: "#cbd5e1",
                        "&:hover": { color: "#6366f1", bgcolor: "#EEF2FF" },
                        transition: "all 0.2s",
                      }}
                    >
                      <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Fade>
            );
          })}
      </Paper>

      {/* CREATE DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={resetDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #f1f5f9", pb: 2, pt: 3, px: 3.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                Register New Customer
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                Fill in the details to create a new customer profile
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {/* Contact Info Section */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#6366f1",
                  letterSpacing: "1px",
                  mb: 1.5,
                  display: "block",
                }}
              >
                Contact Information
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Customer Name"
                  value={form.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  required
                  fullWidth
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                />
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
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
                sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
            </Box>

            {/* Divider */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ height: 1, flex: 1, bgcolor: "#e2e8f0" }} />
              <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                Addresses
              </Typography>
              <Box sx={{ height: 1, flex: 1, bgcolor: "#e2e8f0" }} />
            </Box>

            {addresses.map((addr, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  p: 2.5,
                  border: "1px solid #e2e8f0",
                  borderRadius: 3,
                  bgcolor: "#fafafe",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#c7d2fe" },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: "#6366f1" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569" }}>
                      Address #{idx + 1}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveAddress(idx)}
                    disabled={addresses.length === 1}
                    sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl size="small" sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}>
                    <InputLabel>Type</InputLabel>
                    <Select value={addr.type} label="Type" onChange={(e) => handleAddressChange(idx, "type", e.target.value)}>
                      <MenuItem value="BILLING">Billing</MenuItem>
                      <MenuItem value="SHIPPING">Shipping</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Line 1"
                    value={addr.line1}
                    onChange={(e) => handleAddressChange(idx, "line1", e.target.value)}
                    size="small"
                    fullWidth
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                  <TextField
                    label="Line 2"
                    value={addr.line2}
                    onChange={(e) => handleAddressChange(idx, "line2", e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField label="City" value={addr.city} onChange={(e) => handleAddressChange(idx, "city", e.target.value)} size="small" fullWidth required sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                  <TextField label="District" value={addr.district} onChange={(e) => handleAddressChange(idx, "district", e.target.value)} size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                  <TextField label="Postal Code" value={addr.postalCode} onChange={(e) => handleAddressChange(idx, "postalCode", e.target.value)} size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                  <TextField label="Country" value={addr.country} onChange={(e) => handleAddressChange(idx, "country", e.target.value)} size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                </Box>
              </Paper>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddAddress}
              sx={{
                textTransform: "none",
                alignSelf: "flex-start",
                color: "#6366f1",
                fontWeight: 600,
                borderRadius: 2.5,
                border: "1px dashed #c7d2fe",
                px: 2.5,
                "&:hover": { bgcolor: "#EEF2FF", borderColor: "#6366f1" },
              }}
            >
              Add Another Address
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #f1f5f9" }}>
          <Button
            onClick={resetDialog}
            sx={{ color: "#64748b", textTransform: "none", fontWeight: 600, borderRadius: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCustomer}
            variant="contained"
            disabled={submitting}
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2.5,
              px: 3,
              boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
          >
            {submitting ? "Registering..." : "Register Customer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2.5 }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
