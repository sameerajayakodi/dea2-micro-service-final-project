"use client";

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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { getAllOrders } from "@/services/orders/ordersApi";
import { getAllWorkers } from "@/services/workforce/workersApi";
import { getAllProducts } from "@/services/products/productsApi";

const buildEmptyItem = () => ({
  itemId: "",
  quantityToPick: 1,
  binNo: "",
});

const buildInitialState = () => ({
  orderId: "",
  workerId: "",
  items: [buildEmptyItem()],
});

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value) => UUID_REGEX.test(String(value || ""));

export default function PickPackFormDialog({ open, loading, onClose, onSubmit }) {
  const [form, setForm] = useState(buildInitialState());
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [products, setProducts] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildInitialState());
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let mounted = true;

    const loadData = async () => {
      try {
        setListLoading(true);
        const [ordersRes, workersRes, productsRes] = await Promise.all([
          getAllOrders(),
          getAllWorkers(),
          getAllProducts(),
        ]);

        if (!mounted) return;

        const orderList = Array.isArray(ordersRes?.data)
          ? ordersRes.data
          : Array.isArray(ordersRes?.data?.content)
            ? ordersRes.data.content
            : [];

        const workerList = Array.isArray(workersRes?.data)
          ? workersRes.data
          : Array.isArray(workersRes?.data?.content)
            ? workersRes.data.content
            : [];

        const productList = Array.isArray(productsRes?.data)
          ? productsRes.data
          : Array.isArray(productsRes?.data?.content)
            ? productsRes.data.content
            : [];

        setOrders(orderList);
        setWorkers(workerList);
        setProducts(productList);
      } finally {
        if (mounted) setListLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [open]);

  const selectedOrder = orders.find((order) => String(order?.id) === String(form.orderId));

  const productLookup = products.reduce((acc, product) => {
    if (product?.id !== undefined && product?.id !== null) {
      acc[String(product.id)] = product;
    }
    return acc;
  }, {});

  const productBySku = products.reduce((acc, product) => {
    if (product?.sku) {
      acc[String(product.sku)] = product;
    }
    return acc;
  }, {});

  const rawOrderItems =
    (Array.isArray(selectedOrder?.items) && selectedOrder.items) ||
    (Array.isArray(selectedOrder?.orderItems) && selectedOrder.orderItems) ||
    (Array.isArray(selectedOrder?.orderLines) && selectedOrder.orderLines) ||
    (Array.isArray(selectedOrder?.lines) && selectedOrder.lines) ||
    [];

  const orderItemOptions = rawOrderItems
    .map((item) => {
      const rawItemId = item?.itemId;
      const rawProductId = item?.productId ?? item?.product?.id ?? item?.product?.productId;
      const rawSku = item?.sku ?? item?.productSku ?? item?.product?.sku;

      const productById =
        productLookup[String(rawProductId ?? "")] ||
        productLookup[String(rawItemId ?? "")] ||
        productLookup[String(item?.id ?? "")];

      const product = productById || productBySku[String(rawSku ?? "")];

      const resolvedUuid =
        (product?.id && isUuid(product.id) && String(product.id)) ||
        (rawProductId && isUuid(rawProductId) && String(rawProductId)) ||
        (rawItemId && isUuid(rawItemId) && String(rawItemId)) ||
        null;

      if (!resolvedUuid) return null;

      const labelSku = product?.sku || rawSku || "";
      const labelName = product?.name || item?.productName || item?.product?.name || "";
      const label =
        labelSku && labelName
          ? `${labelSku} - ${labelName}`
          : labelSku || labelName || resolvedUuid;

      return {
        value: resolvedUuid,
        label,
      };
    })
    .filter(Boolean)
    .filter((option, index, arr) => arr.findIndex((x) => x.value === option.value) === index);

  const handleChange = (field, value) => {
    setForm((prev) => {
      if (field === "orderId") {
        return {
          ...prev,
          orderId: value,
          items: prev.items.map((item) => ({ ...item, itemId: "" })),
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const nextItems = prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, items: nextItems };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, buildEmptyItem()] }));
  };

  const removeItem = (index) => {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev;
      return {
        ...prev,
        items: prev.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!String(form.orderId).trim()) {
      nextErrors.orderId = "Order is required";
    }

    const worker = Number(form.workerId);
    if (!String(form.workerId).trim() || Number.isNaN(worker) || worker <= 0) {
      nextErrors.workerId = "Worker is required";
    }

    form.items.forEach((item, index) => {
      if (!String(item.itemId).trim()) {
        nextErrors[`itemId-${index}`] = "Item is required";
      }

      const quantityToPick = Number(item.quantityToPick);
      if (Number.isNaN(quantityToPick) || quantityToPick <= 0) {
        nextErrors[`quantityToPick-${index}`] = "Quantity must be greater than 0";
      }

      if (!String(item.binNo).trim()) {
        nextErrors[`binNo-${index}`] = "Bin No is required";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      orderId: String(form.orderId).trim(),
      workerId: Number(form.workerId),
      items: form.items.map((item) => ({
        itemId: String(item.itemId).trim(),
        quantityToPick: Number(item.quantityToPick),
        binNo: String(item.binNo).trim(),
      })),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Create Pick & Pack Task</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Order"
                value={form.orderId}
                onChange={(e) => handleChange("orderId", e.target.value)}
                error={!!errors.orderId}
                helperText={errors.orderId}
                disabled={loading || listLoading}
              >
                {orders.map((order) => (
                  <MenuItem key={order.id} value={String(order.id)}>
                    {order.orderNumber || String(order.id)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Worker"
                value={form.workerId}
                onChange={(e) => handleChange("workerId", e.target.value)}
                error={!!errors.workerId}
                helperText={errors.workerId}
                disabled={loading || listLoading}
              >
                {workers.map((worker) => (
                  <MenuItem key={worker.id} value={String(worker.id)}>
                    {worker.name || worker.fullName || worker.employeeCode || String(worker.id)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              {form.orderId && orderItemOptions.length === 0 ? (
                <Typography variant="caption" sx={{ color: "#dc2626" }}>
                  Selected order has no items available for picking.
                </Typography>
              ) : null}
            </Grid>

            <Grid size={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: "#475569", fontWeight: 600 }}>
                  Picking Items
                </Typography>

                <Button size="small" startIcon={<AddIcon />} onClick={addItem} disabled={loading}>
                  Add Item
                </Button>
              </Stack>

              <Stack spacing={1.5}>
                {form.items.map((item, index) => (
                  <Box
                    key={`item-${index}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          select
                          fullWidth
                          label="Item"
                          value={item.itemId}
                          onChange={(e) => handleItemChange(index, "itemId", e.target.value)}
                          error={!!errors[`itemId-${index}`]}
                          helperText={errors[`itemId-${index}`]}
                          disabled={!form.orderId || loading || listLoading || orderItemOptions.length === 0}
                        >
                          {orderItemOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Qty To Pick"
                          value={item.quantityToPick}
                          onChange={(e) =>
                            handleItemChange(index, "quantityToPick", e.target.value)
                          }
                          error={!!errors[`quantityToPick-${index}`]}
                          helperText={errors[`quantityToPick-${index}`]}
                          slotProps={{
                            htmlInput: {
                              min: 1,
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="Bin No"
                          value={item.binNo}
                          onChange={(e) => handleItemChange(index, "binNo", e.target.value)}
                          error={!!errors[`binNo-${index}`]}
                          helperText={errors[`binNo-${index}`]}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <IconButton
                            size="small"
                            onClick={() => removeItem(index)}
                            disabled={loading || form.items.length <= 1}
                            sx={{ color: "#ef4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "#64748b" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
