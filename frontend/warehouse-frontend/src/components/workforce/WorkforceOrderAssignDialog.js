"use client";

import { useState } from "react";
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";

/**
 * Dialog for assigning a supervisor and workers to an order.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onSubmit: ({ orderId, supervisorId, workerIds }) => void
 *  - orderId: string (UUID)
 *  - orderNumber: string (display label)
 *  - workers: array of { id, name, role, shift }
 *  - loading: boolean
 */
export default function WorkforceOrderAssignDialog({
  open,
  onClose,
  onSubmit,
  orderId,
  orderNumber,
  workers = [],
  loading = false,
}) {
  const [supervisorId, setSupervisorId] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState([]);

  const handleClose = () => {
    setSupervisorId("");
    setSelectedWorkers([]);
    onClose();
  };

  const handleSubmit = () => {
    if (!supervisorId || selectedWorkers.length === 0) return;
    onSubmit({
      orderId,
      supervisorId: Number(supervisorId),
      workerIds: selectedWorkers.map((w) => w.id),
    });
    setSupervisorId("");
    setSelectedWorkers([]);
  };

  // Only show supervisors in the supervisor dropdown
  const supervisors = workers.filter(
    (w) => w.role === "WAREHOUSE_SUPERVISOR"
  );

  // All workers can be assigned (excluding the selected supervisor)
  const availableWorkers = workers.filter(
    (w) => w.id !== Number(supervisorId)
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GroupIcon sx={{ color: "#6366f1" }} />
          Assign Workers to Order
        </Box>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Order: <strong>{orderNumber || orderId}</strong>
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {/* Supervisor Select */}
        <FormControl fullWidth sx={{ mt: 1, mb: 3 }}>
          <InputLabel id="supervisor-label">Supervisor</InputLabel>
          <Select
            labelId="supervisor-label"
            value={supervisorId}
            label="Supervisor"
            onChange={(e) => setSupervisorId(e.target.value)}
            startAdornment={
              <PersonIcon sx={{ color: "#94a3b8", mr: 1 }} />
            }
          >
            {supervisors.length === 0 && (
              <MenuItem disabled>
                <em>No supervisors available</em>
              </MenuItem>
            )}
            {supervisors.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} (ID: {s.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Workers Multi-Select */}
        <Autocomplete
          multiple
          options={availableWorkers}
          getOptionLabel={(option) =>
            `${option.name} — ${option.role} (${option.shift})`
          }
          value={selectedWorkers}
          onChange={(_, newValue) => setSelectedWorkers(newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={option.name}
                  size="small"
                  {...tagProps}
                  sx={{
                    bgcolor: "#ede9fe",
                    color: "#6366f1",
                    fontWeight: 500,
                  }}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Assign Workers"
              placeholder="Search workers…"
            />
          )}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: "#64748b" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !supervisorId || selectedWorkers.length === 0}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}
