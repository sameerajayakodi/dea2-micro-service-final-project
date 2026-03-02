"use client";

import { useEffect, useState, useCallback } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BuildIcon from "@mui/icons-material/Build";
import CategoryIcon from "@mui/icons-material/Category";
import { Box, Button, Chip, IconButton, Tab, Tabs, Tooltip } from "@mui/material";

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
import EquipmentFormDialog from "@/components/workforce/EquipmentFormDialog";
import EquipmentTypeFormDialog from "@/components/workforce/EquipmentTypeFormDialog";
import {
  LoadingState,
  EmptyState,
  ConfirmDialog,
  Toast,
} from "@/components/workforce/shared";
import {
  getAllEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getAllEquipmentTypes,
  createEquipmentType,
  updateEquipmentType,
  deleteEquipmentType,
} from "@/services/workforce";

const statusStyles = {
  AVAILABLE: { bgcolor: "#dcfce7", color: "#166534" },
  IN_USE: { bgcolor: "#dbeafe", color: "#1e40af" },
  UNDER_MAINTENANCE: { bgcolor: "#fef9c3", color: "#854d0e" },
  DECOMMISSIONED: { bgcolor: "#fee2e2", color: "#991b1b" },
};

export default function EquipmentPage() {
  const [tab, setTab] = useState(0);

  // Equipment state
  const [equipments, setEquipments] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eqFormOpen, setEqFormOpen] = useState(false);
  const [eqEditing, setEqEditing] = useState(null);
  const [eqSaving, setEqSaving] = useState(false);
  const [eqDeleteTarget, setEqDeleteTarget] = useState(null);
  const [eqDeleting, setEqDeleting] = useState(false);

  // Equipment Type state
  const [typeFormOpen, setTypeFormOpen] = useState(false);
  const [typeEditing, setTypeEditing] = useState(null);
  const [typeSaving, setTypeSaving] = useState(false);
  const [typeDeleteTarget, setTypeDeleteTarget] = useState(null);
  const [typeDeleting, setTypeDeleting] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [eqRes, typesRes] = await Promise.all([
        getAllEquipments(),
        getAllEquipmentTypes(),
      ]);
      setEquipments(eqRes.data);
      setEquipmentTypes(typesRes.data);
    } catch {
      setToast({
        open: true,
        message: "Failed to load data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Equipment handlers ───────────────────────────────────────────
  const handleEqCreate = () => {
    setEqEditing(null);
    setEqFormOpen(true);
  };
  const handleEqEdit = (eq) => {
    setEqEditing(eq);
    setEqFormOpen(true);
  };
  const handleEqSubmit = async (data) => {
    try {
      setEqSaving(true);
      if (eqEditing) {
        await updateEquipment(eqEditing.id, data);
        setToast({ open: true, message: "Equipment updated", severity: "success" });
      } else {
        await createEquipment(data);
        setToast({ open: true, message: "Equipment created", severity: "success" });
      }
      setEqFormOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setEqSaving(false);
    }
  };
  const handleEqDelete = async () => {
    try {
      setEqDeleting(true);
      await deleteEquipment(eqDeleteTarget.id);
      setToast({ open: true, message: "Equipment deleted", severity: "success" });
      setEqDeleteTarget(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setEqDeleting(false);
    }
  };

  // ─── Equipment Type handlers ──────────────────────────────────────
  const handleTypeCreate = () => {
    setTypeEditing(null);
    setTypeFormOpen(true);
  };
  const handleTypeEdit = (type) => {
    setTypeEditing(type);
    setTypeFormOpen(true);
  };
  const handleTypeSubmit = async (data) => {
    try {
      setTypeSaving(true);
      if (typeEditing) {
        await updateEquipmentType(typeEditing.id, data);
        setToast({ open: true, message: "Equipment type updated", severity: "success" });
      } else {
        await createEquipmentType(data);
        setToast({ open: true, message: "Equipment type created", severity: "success" });
      }
      setTypeFormOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setTypeSaving(false);
    }
  };
  const handleTypeDelete = async () => {
    try {
      setTypeDeleting(true);
      await deleteEquipmentType(typeDeleteTarget.id);
      setToast({ open: true, message: "Equipment type deleted", severity: "success" });
      setTypeDeleteTarget(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      setToast({ open: true, message: msg, severity: "error" });
    } finally {
      setTypeDeleting(false);
    }
  };

  // ─── Column definitions ───────────────────────────────────────────
  const actionButtons = (onEdit, onDelete) => (row) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onEdit(row); }}
          sx={{ color: "#6366f1" }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(row); }}
          sx={{ color: "#ef4444" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const eqColumns = [
    { id: "id", label: "ID", sortable: true },
    { id: "name", label: "Name", sortable: true },
    {
      id: "status", label: "Status", sortable: true,
      render: (row) => {
        const style = statusStyles[row.status] || { bgcolor: "#f1f5f9", color: "#475569" };
        return <Chip label={row.status.replace(/_/g, " ")} size="small" sx={{ fontWeight: 600, ...style }} />;
      },
    },
    { id: "equipmentTypeName", label: "Type", sortable: true },
    {
      id: "description", label: "Description", sortable: false,
      render: (row) => (
        <Box sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#64748b" }}>
          {row.description || "—"}
        </Box>
      ),
    },
    { id: "actions", label: "Actions", sortable: false, align: "right", render: actionButtons(handleEqEdit, setEqDeleteTarget) },
  ];

  const typeColumns = [
    { id: "id", label: "ID", sortable: true },
    { id: "name", label: "Name", sortable: true },
    { id: "manufacturer", label: "Manufacturer", sortable: true },
    { id: "model", label: "Model", sortable: true },
    {
      id: "description", label: "Description", sortable: false,
      render: (row) => (
        <Box sx={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#64748b" }}>
          {row.description || "—"}
        </Box>
      ),
    },
    { id: "actions", label: "Actions", sortable: false, align: "right", render: actionButtons(handleTypeEdit, setTypeDeleteTarget) },
  ];

  if (loading) return <LoadingState message="Loading equipment..." />;

  return (
    <Box>
      <PageHeader
        title="Equipment"
        subtitle="Track all warehouse equipment and manage equipment categories."
        icon={<BuildIcon sx={{ fontSize: 32 }} />}
        backHref="/workforce_service"
        count={tab === 0 ? equipments.length : equipmentTypes.length}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={tab === 0 ? handleEqCreate : handleTypeCreate}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            {tab === 0 ? "Add Equipment" : "Add Type"}
          </Button>
        }
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": { fontWeight: 600, textTransform: "none" },
            "& .Mui-selected": { color: "#6366f1" },
            "& .MuiTabs-indicator": { backgroundColor: "#6366f1" },
          }}
        >
          <Tab icon={<BuildIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Equipment" />
          <Tab icon={<CategoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Equipment Types" />
        </Tabs>
      </Box>

      {/* Equipment Tab */}
      {tab === 0 && (
        <>
          <DataTable
            columns={eqColumns}
            rows={equipments}
            searchKeys={["name", "status", "equipmentTypeName"]}
            emptyComponent={<EmptyState icon={<BuildIcon />} message="No equipment found." />}
          />
          <EquipmentFormDialog
            open={eqFormOpen}
            onClose={() => setEqFormOpen(false)}
            onSubmit={handleEqSubmit}
            equipment={eqEditing}
            equipmentTypes={equipmentTypes}
            loading={eqSaving}
          />
          <ConfirmDialog
            open={Boolean(eqDeleteTarget)}
            title="Delete Equipment"
            message={`Delete "${eqDeleteTarget?.name}"? All assignments and maintenance logs will also be removed.`}
            onConfirm={handleEqDelete}
            onCancel={() => setEqDeleteTarget(null)}
            loading={eqDeleting}
          />
        </>
      )}

      {/* Equipment Types Tab */}
      {tab === 1 && (
        <>
          <DataTable
            columns={typeColumns}
            rows={equipmentTypes}
            searchKeys={["name", "manufacturer", "model"]}
            emptyComponent={<EmptyState icon={<CategoryIcon />} message="No equipment types found." />}
          />
          <EquipmentTypeFormDialog
            open={typeFormOpen}
            onClose={() => setTypeFormOpen(false)}
            onSubmit={handleTypeSubmit}
            equipmentType={typeEditing}
            loading={typeSaving}
          />
          <ConfirmDialog
            open={Boolean(typeDeleteTarget)}
            title="Delete Equipment Type"
            message={`Delete "${typeDeleteTarget?.name}"? All equipment under this type will also be removed.`}
            onConfirm={handleTypeDelete}
            onCancel={() => setTypeDeleteTarget(null)}
            loading={typeDeleting}
          />
        </>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
