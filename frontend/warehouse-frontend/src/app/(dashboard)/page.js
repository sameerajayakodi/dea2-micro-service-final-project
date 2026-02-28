"use client";

import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import PeopleIcon from "@mui/icons-material/People";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import {
  Avatar,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const services = [
  {
    label: "Customers",
    icon: <PeopleIcon />,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    label: "Dispatch",
    icon: <LocalShippingIcon />,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    label: "Inbound",
    icon: <MoveToInboxIcon />,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    label: "Inventory",
    icon: <InventoryIcon />,
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    label: "Orders",
    icon: <ShoppingCartIcon />,
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    label: "Picking",
    icon: <PlaylistAddCheckIcon />,
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
  {
    label: "Products",
    icon: <CategoryIcon />,
    gradient: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  },
  {
    label: "Storage",
    icon: <WarehouseIcon />,
    gradient: "linear-gradient(135deg, #667eea 0%, #6dd5ed 100%)",
  },
  {
    label: "Suppliers",
    icon: <BusinessIcon />,
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  },
  {
    label: "Workforce",
    icon: <BadgeIcon />,
    gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  },
];

export default function DashboardPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, color: "#1e293b" }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600 }}>
          Welcome to the Warehouse Management System. Monitor and manage all
          your services from one place.
        </Typography>
      </Box>

      {/* Quick stats */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { label: "Total Services", value: "10", color: "#6366f1" },
          { label: "Active", value: "10", color: "#22c55e" },
          { label: "Uptime", value: "99.9%", color: "#f59e0b" },
        ].map((stat) => (
          <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", fontWeight: 500, mb: 0.5 }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: stat.color }}
                >
                  {stat.value}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: `${stat.color}15`,
                  width: 48,
                  height: 48,
                }}
              >
                <TrendingUpIcon sx={{ color: stat.color }} />
              </Avatar>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Services heading */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
          Services
        </Typography>
        <Chip
          label={`${services.length} total`}
          size="small"
          sx={{
            bgcolor: "#ede9fe",
            color: "#6366f1",
            fontWeight: 600,
          }}
        />
      </Stack>

      {/* Service cards */}
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={service.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow:
                    "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
                  borderColor: "transparent",
                },
              }}
            >
              <Avatar
                sx={{
                  background: service.gradient,
                  width: 48,
                  height: 48,
                }}
              >
                {service.icon}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#1e293b", lineHeight: 1.3 }}
                >
                  {service.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Manage
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
