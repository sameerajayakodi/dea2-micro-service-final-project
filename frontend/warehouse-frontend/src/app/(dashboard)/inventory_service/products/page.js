"use client";

import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
import {
  ConfirmDialog,
  EmptyState,
  LoadingState,
  Toast,
} from "@/components/workforce/shared";
import {
  createInventoryProduct,
  deleteInventoryProduct,
  getAllInventoryProducts,
  updateInventoryProduct,
} from "@/services/inventory";

const initialForm = {
  productName: "",
  unitPrice: "",
  category: "",
};

function ProductFormDialog({ open, product, loading, onClose, onSubmit }) {
  const getInitialForm = () => {
    if (product) {
      return {
        productName: product.productName || "",
        unitPrice: String(product.unitPrice ?? ""),
        category: product.category || "",
      };
    }
    return initialForm;
  };

  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(product);

  const validate = () => {
    const nextErrors = {};
    if (!form.productName.trim()) nextErrors.productName = "Product name is required";
    if (!form.unitPrice || Number(form.unitPrice) <= 0) {
      nextErrors.unitPrice = "Unit price must be greater than 0";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      productName: form.productName.trim(),
      unitPrice: Number(form.unitPrice),
      category: form.category.trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? "Edit Product" : "Add Product"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                error={!!errors.productName}
                helperText={errors.productName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Unit Price"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "#64748b" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
        >
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function InventoryProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllInventoryProducts();
      setProducts(res.data);
    } catch {
      setToast({
        open: true,
        message: "Failed to load products",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      if (editing) {
        await updateInventoryProduct(editing.productId, payload);
        setToast({ open: true, message: "Product updated", severity: "success" });
      } else {
        await createInventoryProduct(payload);
        setToast({ open: true, message: "Product created", severity: "success" });
      }
      setFormOpen(false);
      fetchProducts();
    } catch (err) {
      const message = err.response?.data?.message || "Operation failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteInventoryProduct(deleteTarget.productId);
      setDeleteTarget(null);
      setToast({ open: true, message: "Product deleted", severity: "success" });
      fetchProducts();
    } catch (err) {
      const message = err.response?.data?.message || "Delete failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { id: "productId", label: "ID", sortable: true },
    { id: "productName", label: "Product", sortable: true },
    {
      id: "unitPrice",
      label: "Unit Price",
      sortable: true,
      render: (row) => `$${Number(row.unitPrice || 0).toFixed(2)}`,
    },
    {
      id: "category",
      label: "Category",
      sortable: true,
      render: (row) => row.category || "—",
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              sx={{ color: "#6366f1" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row);
              }}
              sx={{ color: "#ef4444" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading products..." />;

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle="Maintain product master records used by inventory batches."
        icon={<Inventory2Icon sx={{ fontSize: 32 }} />}
        backHref="/inventory_service"
        count={products.length}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Add Product
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={products}
        searchKeys={["productName", "category"]}
        emptyComponent={<EmptyState icon={<Inventory2Icon />} message="No products found." />}
      />

      <ProductFormDialog
        key={`${editing?.productId ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        product={editing}
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Delete product "${deleteTarget?.productName}"? Linked inventory records may be affected.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </Box>
  );
}
