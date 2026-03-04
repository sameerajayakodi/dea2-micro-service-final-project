"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

import { getPickPackById } from "@/services/pick_pack";

const statusColor = (value) => {
  const status = String(value || "").toUpperCase();
  if (["COMPLETED", "PACKED", "READY_TO_SHIP"].includes(status)) return "success";
  if (["PICKING", "PACKING", "PICKED"].includes(status)) return "warning";
  if (status === "CANCELLED") return "error";
  return "default";
};

export default function PickPackServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPickPackById(id);
      setRecord(res.data);
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchRecord();
  }, [id, fetchRecord]);

  const items = useMemo(() => {
    if (!Array.isArray(record?.items)) return [];
    return record.items;
  }, [record]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  if (!record) {
    return (
      <Box>
        <Typography variant="h6" sx={{ color: "#1e293b", mb: 2 }}>
          Pick & Pack record not found.
        </Typography>
        <Typography
          role="button"
          onClick={() => router.push("/pick_pack_service")}
          sx={{ color: "#6366f1", cursor: "pointer", width: "fit-content" }}
        >
          Back to Pick & Pack
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton
          onClick={() => router.push("/pick_pack_service")}
          sx={{ color: "#64748b", "&:hover": { bgcolor: "#f1f5f9" } }}
        >
          <ArrowBackIcon />
        </IconButton>

        <LocalShippingIcon sx={{ color: "#6366f1" }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Pick & Pack Details
        </Typography>
        <Chip
          size="small"
          label={record.status || "UNKNOWN"}
          color={statusColor(record.status)}
          sx={{ fontWeight: 600, textTransform: "uppercase" }}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}
      >
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <Typography><strong>Reference:</strong> {record.referenceNo || record.pickPackId || record.id}</Typography>
          <Typography><strong>Order ID:</strong> {record.orderId || "—"}</Typography>
          <Typography><strong>Picker ID:</strong> {record.pickerId || "—"}</Typography>
          <Typography><strong>Packer ID:</strong> {record.packerId || "—"}</Typography>
          <Typography><strong>Priority:</strong> {record.priority || "NORMAL"}</Typography>
          <Typography>
            <strong>Created:</strong> {record.createdAt ? dayjs(record.createdAt).format("YYYY-MM-DD HH:mm") : "—"}
          </Typography>
        </Box>

        {record.notes ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ color: "#475569" }}>{record.notes}</Typography>
          </>
        ) : null}
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Inventory2Icon sx={{ color: "#6366f1" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Items ({items.length})
          </Typography>
        </Box>

        {items.length === 0 ? (
          <Typography sx={{ color: "#94a3b8" }}>No item details available.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {items.map((item, index) => (
              <Box
                key={`${item.itemId || index}-${index}`}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "#f1f5f9",
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" },
                  gap: 1,
                }}
              >
                <Typography><strong>Item:</strong> {item.itemId || item.sku || "—"}</Typography>
                <Typography><strong>Qty:</strong> {item.quantity ?? item.qty ?? 0}</Typography>
                <Typography><strong>Status:</strong> {item.status || "—"}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
