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
  InputAdornment,
  Avatar,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // Using ShoppingCart or maybe distinct one like Inventory
import InventoryIcon from "@mui/icons-material/Inventory";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  activateProduct,
  deactivateProduct
} from "@/services/products/productsApi";

/* ── Status → Chip color mapping ─────────────────────────────── */
const getStatusChipProps = (isActive) => {
  return isActive
    ? { color: "success", label: "Active" }
    : { color: "default", label: "Inactive" };
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function ProductServicePage() {
  const router = useRouter();

  // ── Table state ──
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Create‑wizard & View state ──
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    skuCode: "",
    category: "",
    price: "",
    description: "",
    imageUrl: "",
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Toast state ──
  const [toast, setToast] = useState({ open: false, severity: "success", msg: "" });

  // ── Fetch products ──
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllProducts();
      // Adjust according to actual spring data wrapper or array response
      const rows = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setProducts(rows);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setToast({ open: true, severity: "error", msg: "Failed to load products" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Form helpers ──
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetWizard = () => {
    setWizardOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      skuCode: "",
      category: "",
      price: "",
      description: "",
      imageUrl: "",
      active: true,
    });
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || "",
      skuCode: product.skuCode || "",
      category: product.category || "",
      price: product.price || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      active: product.active ?? true,
    });
    setWizardOpen(true);
  };

  // ── Submit product ──
  const handleSubmitProduct = async () => {
    if (!formData.name.trim() || !formData.skuCode.trim() || !formData.price) {
      setToast({ open: true, severity: "warning", msg: "Name, SKU Code, and Price are required" });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProduct(editingId, {
          name: formData.name,
          skuCode: formData.skuCode,
          category: formData.category,
          price: Number(formData.price),
          description: formData.description,
          imageUrl: formData.imageUrl,
          active: formData.active,
        });
        setToast({ open: true, severity: "success", msg: "Product updated successfully!" });
      } else {
        await createProduct({
          name: formData.name,
          skuCode: formData.skuCode,
          category: formData.category,
          price: Number(formData.price),
          description: formData.description,
          imageUrl: formData.imageUrl,
          active: formData.active,
        });
        setToast({ open: true, severity: "success", msg: "Product created successfully!" });
      }
      resetWizard();
      fetchProducts();
    } catch (err) {
      console.error("Save product failed:", err);
      // Give a more descriptive error based on what the server returned, rather than hardcoding the SKU message
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to save product.";
      setToast({ open: true, severity: "error", msg: `Error: ${errorMsg}` });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Active Status ──
  const handleToggleActive = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await deactivateProduct(id);
      } else {
        await activateProduct(id);
      }
      setToast({ open: true, severity: "success", msg: `Product successfully ${currentStatus ? 'deactivated' : 'activated'}!` });
      fetchProducts();
    } catch (error) {
      console.error("Failed to update status", error);
      setToast({ open: true, severity: "error", msg: "Failed to update product status" });
    }
  };

  // ── Delete product ──
  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setToast({ open: true, severity: "success", msg: "Product deleted successfully!" });
      fetchProducts();
    } catch (err) {
      console.error("Delete product failed:", err);
      setToast({ open: true, severity: "error", msg: "Failed to delete product" });
    }
  };

  // ── DataGrid columns ──
  const columns = [
    {
      field: "skuCode",
      headerName: "SKU Code",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
          <Avatar
            src={params.row.imageUrl || ""}
            alt={params.row.name}
            variant="rounded"
            sx={{ width: 36, height: 36, bgcolor: "#e2e8f0" }}
          >
            {/* Fallback to first letter if no image */}
            {!params.row.imageUrl && params.row.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Typography
            variant="body2"
            onClick={() => router.push(`/product_service/${params.row.id}`)}
            sx={{
              cursor: "pointer",
              color: "#6366f1",
              fontFamily: "monospace",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline", color: "#4f46e5" },
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "Product Name", flex: 1, minWidth: 200 },
    { field: "category", headerName: "Category", flex: 0.7, minWidth: 140 },
    {
      field: "price",
      headerName: "Price ($)",
      flex: 0.5,
      minWidth: 110,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => `$${Number(value ?? 0).toFixed(2)}`,
    },
    {
      field: "active",
      headerName: "Status",
      flex: 0.5,
      minWidth: 120,
      renderCell: (params) => {
        const { color, label } = getStatusChipProps(params.value);
        return (
          <Chip
            label={label}
            color={color}
            size="small"
            sx={{ fontWeight: 600, letterSpacing: "0.3px", cursor: 'pointer' }}
            onClick={() => handleToggleActive(params.row.id, params.value)}
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Date Added",
      flex: 0.8,
      minWidth: 160,
      valueGetter: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "—"),
    },
    {
      field: "actions",
      headerName: "",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleEditClick(params.row)}
            sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setViewProduct(params.row);
              setViewDialogOpen(true);
            }}
            sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteProduct(params.row.id)}
            sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // ── Filter products logic ──
  const filteredProducts = products.filter((p) => {
    const term = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.skuCode && p.skuCode.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  });

  /* ─── RENDER ──────────────────────────────────────────────── */
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
            <InventoryIcon sx={{ fontSize: 32, color: "#6366f1" }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Product Catalog
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "divider" },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchProducts}
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
              onClick={() => setWizardOpen(true)}
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
              Add Product
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Manage warehouse product catalog instances. Assign categories, prices, and SKUs to your new products.
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
          rows={filteredProducts}
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
          CREATE PRODUCT DIALOG
          ══════════════════════════════════════════════════════ */}
      <Dialog
        open={wizardOpen}
        onClose={resetWizard}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            {editingId ? "Edit Product" : "Add New Product"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>

            <TextField
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              size="small"
              fullWidth
              required
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="SKU Code"
                value={formData.skuCode}
                onChange={(e) => handleFormChange("skuCode", e.target.value)}
                size="small"
                fullWidth
                required
              />
              <TextField
                select
                label="Category"
                value={formData.category}
                onChange={(e) => handleFormChange("category", e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Clothing">Clothing</MenuItem>
                <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                <MenuItem value="Furniture">Furniture</MenuItem>
                <MenuItem value="Toys">Toys</MenuItem>
                <MenuItem value="Hardware">Hardware</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Price ($)"
                type="number"
                value={formData.price}
                onChange={(e) => handleFormChange("price", e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, pl: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={(e) => handleFormChange("active", e.target.checked)}
                      color="primary"
                    />
                  }
                  label={formData.active ? "Active" : "Inactive"}
                  sx={{ color: "#64748b" }}
                />
              </Box>
            </Box>

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              label="Image URL"
              value={formData.imageUrl}
              onChange={(e) => handleFormChange("imageUrl", e.target.value)}
              size="small"
              fullWidth
            />

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={resetWizard} sx={{ color: "#64748b", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitProduct}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#6366f1",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {submitting ? "Saving…" : "Save Product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════
          VIEW PRODUCT DIALOG
          ══════════════════════════════════════════════════════ */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", textAlign: "center" }}>
            Product Summary
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewProduct && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
              <Avatar
                src={viewProduct.imageUrl || ""}
                alt={viewProduct.name}
                variant="rounded"
                sx={{ width: 80, height: 80, bgcolor: "#e2e8f0", mb: 1, boxShadow: 1 }}
              >
                {!viewProduct.imageUrl && viewProduct.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", textAlign: "center", lineHeight: 1.2 }}>
                {viewProduct.name}
              </Typography>

              <Chip
                {...getStatusChipProps(viewProduct.active)}
                size="small"
                sx={{ fontWeight: 600, mb: 1 }}
              />

              <Box sx={{ width: "100%", bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">SKU Code</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace", color: "#6366f1" }}>{viewProduct.skuCode}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Category</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewProduct.category || "—"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Price</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#10b981" }}>${Number(viewProduct.price ?? 0).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Added On</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewProduct.createdAt ? dayjs(viewProduct.createdAt).format("YYYY-MM-DD") : "—"}</Typography>
                </Box>
              </Box>

              {viewProduct.description && (
                <Box sx={{ width: "100%", mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569", mt: 0.5, lineHeight: 1.6 }}>
                    {viewProduct.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider", justifyContent: "center" }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
            fullWidth
            sx={{
              color: "#64748b",
              borderColor: "divider",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#f1f5f9" }
            }}
          >
            Close
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
