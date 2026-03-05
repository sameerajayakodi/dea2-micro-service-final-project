"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { useRouter } from "next/navigation";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
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
  createInventory,
  deleteInventory,
  getAllInventories,
  getAllInventoryProducts,
  getAllStorageLocations,
  updateInventory,
} from "@/services/inventory";

const statusColor = {
  AVAILABLE: { bgcolor: "#dcfce7", color: "#166534" },
  RESERVED: { bgcolor: "#dbeafe", color: "#1e40af" },
  DAMAGED: { bgcolor: "#fee2e2", color: "#991b1b" },
  OUT_OF_STOCK: { bgcolor: "#f1f5f9", color: "#334155" },
};

const initialForm = {
  batchNo: "",
  quantityAvailable: "",
  quantityReserved: "0",
  quantityDamaged: "0",
  expiryDate: "",
  lowStockThreshold: "",
  productId: "",
  locationId: "",
};

function InventoryFormDialog({
  open,
  inventory,
  products,
  productsLoading,
  locations,
  loading,
  onClose,
  onSubmit,
}) {
  const getInitialForm = () => {
    if (inventory) {
      return {
        batchNo: inventory.batchNo || "",
        quantityAvailable: String(inventory.quantityAvailable ?? ""),
        quantityReserved: String(inventory.quantityReserved ?? 0),
        quantityDamaged: String(inventory.quantityDamaged ?? 0),
        expiryDate: inventory.expiryDate || "",
        lowStockThreshold: String(inventory.lowStockThreshold ?? ""),
        productId: String(inventory.productId ?? ""),
        locationId: String(inventory.locationId ?? ""),
      };
    }
    return initialForm;
  };

  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(inventory);

  const validate = () => {
    const nextErrors = {};
    if (!form.batchNo.trim()) nextErrors.batchNo = "Batch number is required";
    if (!form.quantityAvailable || Number(form.quantityAvailable) <= 0) {
      nextErrors.quantityAvailable = "Quantity available must be greater than 0";
    }
    if (Number(form.quantityReserved) < 0) {
      nextErrors.quantityReserved = "Reserved quantity cannot be negative";
    }
    if (Number(form.quantityDamaged) < 0) {
      nextErrors.quantityDamaged = "Damaged quantity cannot be negative";
    }
    if (!form.productId) nextErrors.productId = "Product is required";
    if (!form.locationId) nextErrors.locationId = "Storage location is required";
    if (form.lowStockThreshold && Number(form.lowStockThreshold) < 0) {
      nextErrors.lowStockThreshold = "Low-stock threshold must be 0 or more";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      batchNo: form.batchNo.trim(),
      quantityAvailable: Number(form.quantityAvailable),
      quantityReserved: Number(form.quantityReserved || 0),
      quantityDamaged: Number(form.quantityDamaged || 0),
      expiryDate: form.expiryDate || null,
      lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : null,
      productId: form.productId,
      locationId: Number(form.locationId),
    });
  };

  const selectedProduct =
    products.find((p) => String(p.productId) === String(form.productId)) || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? "Edit Inventory" : "Add Inventory"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Batch Number"
                value={form.batchNo}
                onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
                error={!!errors.batchNo}
                helperText={errors.batchNo}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={products}
                loading={productsLoading}
                value={selectedProduct}
                isOptionEqualToValue={(option, value) =>
                  String(option.productId) === String(value.productId)
                }
                getOptionLabel={(option) => option.productName || ""}
                onChange={(_, value) =>
                  setForm({ ...form, productId: value ? String(value.productId) : "" })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Product"
                    error={!!errors.productId}
                    helperText={errors.productId}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {productsLoading ? <CircularProgress color="inherit" size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Storage Location"
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                error={!!errors.locationId}
                helperText={errors.locationId}
              >
                {locations.map((location) => (
                  <MenuItem key={location.locationId} value={location.locationId}>
                    {`${location.zone} / ${location.rackNo} / ${location.binNo}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Quantity Available"
                value={form.quantityAvailable}
                onChange={(e) =>
                  setForm({ ...form, quantityAvailable: e.target.value })
                }
                error={!!errors.quantityAvailable}
                helperText={errors.quantityAvailable}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Quantity Reserved"
                value={form.quantityReserved}
                onChange={(e) => setForm({ ...form, quantityReserved: e.target.value })}
                error={!!errors.quantityReserved}
                helperText={errors.quantityReserved}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Quantity Damaged"
                value={form.quantityDamaged}
                onChange={(e) => setForm({ ...form, quantityDamaged: e.target.value })}
                error={!!errors.quantityDamaged}
                helperText={errors.quantityDamaged}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Low-stock Threshold"
                value={form.lowStockThreshold}
                onChange={(e) =>
                  setForm({ ...form, lowStockThreshold: e.target.value })
                }
                error={!!errors.lowStockThreshold}
                helperText={errors.lowStockThreshold}
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

export default function InventoriesPage() {
  const router = useRouter();
  const [inventories, setInventories] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
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

  const locationMap = useMemo(() => {
    const map = new Map();
    locations.forEach((location) => {
      map.set(
        location.locationId,
        `${location.zone} / ${location.rackNo} / ${location.binNo}`,
      );
    });
    return map;
  }, [locations]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [invResult, prodResult, locResult] = await Promise.allSettled([
        getAllInventories(),
        getAllInventoryProducts(),
        getAllStorageLocations(),
      ]);

      setInventories(
        invResult.status === "fulfilled" && Array.isArray(invResult.value?.data)
          ? invResult.value.data
          : [],
      );

      setProducts(
        prodResult.status === "fulfilled" && Array.isArray(prodResult.value?.data)
          ? prodResult.value.data
          : [],
      );

      setLocations(
        locResult.status === "fulfilled" && Array.isArray(locResult.value?.data)
          ? locResult.value.data
          : [],
      );

      const failed = [];
      if (invResult.status === "rejected") failed.push("inventories");
      if (prodResult.status === "rejected") failed.push("products");
      if (locResult.status === "rejected") failed.push("storage locations");

      if (failed.length > 0) {
        setToast({
          open: true,
          message: `Failed to load ${failed.join(", ")}`,
          severity: "warning",
        });
      }
    } catch {
      setToast({
        open: true,
        message: "Failed to load inventory data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (inventory) => {
    setEditing(inventory);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      if (editing) {
        await updateInventory(editing.inventoryId, payload);
        setToast({ open: true, message: "Inventory updated", severity: "success" });
      } else {
        await createInventory(payload);
        setToast({ open: true, message: "Inventory created", severity: "success" });
      }
      setFormOpen(false);
      fetchData();
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
      await deleteInventory(deleteTarget.inventoryId);
      setDeleteTarget(null);
      setToast({ open: true, message: "Inventory deleted", severity: "success" });
      fetchData();
    } catch (err) {
      const message = err.response?.data?.message || "Delete failed";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { id: "inventoryId", label: "ID", sortable: true },
    { id: "batchNo", label: "Batch", sortable: true },
    { id: "productName", label: "Product", sortable: true },
    {
      id: "location",
      label: "Location",
      sortable: false,
      render: (row) =>
        row.zone && row.rackNo && row.binNo
          ? `${row.zone} / ${row.rackNo} / ${row.binNo}`
          : locationMap.get(row.locationId) || "—",
    },
    { id: "quantityAvailable", label: "Available", sortable: true },
    { id: "quantityReserved", label: "Reserved", sortable: true },
    { id: "quantityDamaged", label: "Damaged", sortable: true },
    {
      id: "stockStatus",
      label: "Status",
      sortable: true,
      render: (row) => {
        const style = statusColor[row.stockStatus] || {
          bgcolor: "#f1f5f9",
          color: "#334155",
        };
        return (
          <Chip
            label={row.stockStatus?.replace(/_/g, " ") || "UNKNOWN"}
            size="small"
            sx={{ fontWeight: 600, ...style }}
          />
        );
      },
    },
    {
      id: "isLowStock",
      label: "Low Stock",
      sortable: true,
      render: (row) => (
        <Chip
          label={row.isLowStock ? "Yes" : "No"}
          size="small"
          sx={{
            bgcolor: row.isLowStock ? "#fee2e2" : "#dcfce7",
            color: row.isLowStock ? "#991b1b" : "#166534",
            fontWeight: 600,
          }}
        />
      ),
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

  if (loading) return <LoadingState message="Loading inventories..." />;

  return (
    <Box>
      <PageHeader
        title="Inventories"
        subtitle="Manage inventory batches, quantities, and stock status by product and location."
        icon={<Inventory2Icon sx={{ fontSize: 32 }} />}
        backHref="/inventory_service"
        count={inventories.length}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Add Inventory
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={inventories}
        searchKeys={["batchNo", "productName", "stockStatus", "zone", "rackNo", "binNo"]}
        onRowClick={(row) => router.push(`/inventory_service/${row.inventoryId}`)}
        emptyComponent={
          <EmptyState icon={<Inventory2Icon />} message="No inventory records found." />
        }
      />

      <InventoryFormDialog
        key={`${editing?.inventoryId ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        inventory={editing}
        products={products}
        productsLoading={loading}
        locations={locations}
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Inventory"
        message={`Delete batch "${deleteTarget?.batchNo}"? This action cannot be undone.`}
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
