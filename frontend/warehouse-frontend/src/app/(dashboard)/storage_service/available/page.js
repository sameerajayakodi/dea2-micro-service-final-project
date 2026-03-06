"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";

import DataTable from "@/components/workforce/DataTable";
import PageHeader from "@/components/workforce/PageHeader";
import { EmptyState, LoadingState, Toast } from "@/components/workforce/shared";
import { getAvailableStorageLocations } from "@/services/storage_service";

function getApiErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (data?.message) {
    if (Array.isArray(data.details) && data.details.length > 0) {
      return `${data.message}: ${data.details.join(" | ")}`;
    }
    return data.message;
  }
  return fallback;
}

export default function AvailableStorageLocationsPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAvailableStorageLocations();
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setToast({
        open: true,
        message: getApiErrorMessage(err, "Failed to load available locations"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  if (loading) return <LoadingState message="Loading available locations..." />;

  const columns = [
    { id: "locationId", label: "ID", sortable: true },
    { id: "zone", label: "Zone", sortable: true },
    { id: "rackNo", label: "Rack", sortable: true },
    { id: "binNo", label: "Bin", sortable: true },
    {
      id: "availabilityStatus",
      label: "Status",
      sortable: true,
      render: (row) => (
        <Chip
          size="small"
          label={String(row.availabilityStatus ?? "UNKNOWN").replace(/_/g, " ")}
          sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 600 }}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Tooltip title="Open details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/storage_service/${row.locationId}`);
              }}
              sx={{ color: "#0f766e" }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Available Storage Locations"
        subtitle="Locations currently marked AVAILABLE by the storage location service."
        icon={<WarehouseIcon sx={{ fontSize: 32 }} />}
        backHref="/storage_service"
        count={rows.length}
      />

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={["locationId", "zone", "rackNo", "binNo"]}
        onRowClick={(row) => router.push(`/storage_service/${row.locationId}`)}
        emptyComponent={
          <EmptyState
            icon={<WarehouseIcon />}
            message="No available storage locations at the moment."
          />
        }
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
