"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DnsIcon from "@mui/icons-material/Dns";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HubIcon from "@mui/icons-material/Hub";
import RouterIcon from "@mui/icons-material/Router";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import OutboxIcon from "@mui/icons-material/Outbox";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CircleIcon from "@mui/icons-material/Circle";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

/**
 * Maps dashboard label → Eureka application name (upper-case, as Eureka stores them).
 * Adjust these if a service registers under a different name.
 */
const services = [
  {
    label: "API Gateway",
    eurekaName: "API-GATEWAY",
    href: "#",
    icon: <RouterIcon />,
    gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  },
  {
    label: "Customers",
    eurekaName: "CUSTOMER-MANAGEMENT-SERVICE",
    href: "/customer_service",
    icon: <PeopleIcon />,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    label: "Dispatch",
    eurekaName: "DISPATCH-TRANSPORTATION-SERVICE",
    href: "/dispatch_service",
    icon: <LocalShippingIcon />,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    label: "Inbound",
    eurekaName: "INBOUND-RECEIVING-SERVICE",
    href: "/inbound_service",
    icon: <MoveToInboxIcon />,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    label: "Inventory",
    eurekaName: "INVENTORY-MANAGEMENT-SERVICE",
    href: "/inventory_service",
    icon: <InventoryIcon />,
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    label: "Orders",
    eurekaName: "ORDER-SERVICE",
    href: "/order_service",
    icon: <ShoppingCartIcon />,
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    label: "Pick & Pack",
    eurekaName: "PICKING-PACKING-SERVICE",
    href: "/pick_pack_service",
    icon: <OutboxIcon />,
    gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  },
  {
    label: "Product Catalog",
    eurekaName: "PRODUCT-CATALOG-SERVICE",
    href: "/product_service",
    icon: <CategoryIcon />,
    gradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  },
  {
    label: "Storage Location",
    eurekaName: "STORAGE-LOCATION-SERVICE",
    href: "/storage_service",
    icon: <WarehouseIcon />,
    gradient: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
  },
  {
    label: "Suppliers",
    eurekaName: "SUPPLIER-MANAGEMENT-SERVICE",
    href: "/supplier_service",
    icon: <BusinessIcon />,
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  },
  {
    label: "Workforce",
    eurekaName: "WORKFORCE-EQUIPMENT-SERVICE",
    href: "/workforce_service",
    icon: <BadgeIcon />,
    gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  },
];

/** Colour for each possible status */
const STATUS_COLORS = {
  UP: "#22c55e",
  DOWN: "#ef4444",
  UNKNOWN: "#94a3b8",
};

export default function DashboardPage() {
  const [eurekaServices, setEurekaServices] = useState(null); // null = loading
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/eureka");
        const data = await res.json();
        if (!cancelled) {
          setEurekaServices(data.services ?? []);
          setError(data.error ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setEurekaServices([]);
          setError("Could not reach Eureka");
        }
      }
    }

    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  /** Look up a service's Eureka status */
  function getStatus(eurekaName) {
    if (eurekaServices === null) return "LOADING";
    const match = eurekaServices.find(
      (s) => s.name.toUpperCase() === eurekaName.toUpperCase()
    );
    return match ? match.status : "DOWN";
  }

  const isLoading = eurekaServices === null;
  const activeCount = isLoading
    ? "–"
    : services.filter((s) => getStatus(s.eurekaName) === "UP").length;
  const downCount = isLoading
    ? "–"
    : services.filter((s) => getStatus(s.eurekaName) === "DOWN").length;

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
          {
            label: "Total Services",
            value: String(services.length),
            color: "#6366f1",
            icon: <DnsIcon sx={{ color: "#6366f1" }} />,
          },
          {
            label: "Active",
            value: String(activeCount),
            color: "#22c55e",
            icon: <CheckCircleOutlineIcon sx={{ color: "#22c55e" }} />,
          },
          {
            label: "Down",
            value: String(downCount),
            color: "#ef4444",
            icon: <ErrorOutlineIcon sx={{ color: "#ef4444" }} />,
          },
          {
            label: "Uptime",
            value: "99.9%",
            color: "#f59e0b",
            icon: <AccessTimeIcon sx={{ color: "#f59e0b" }} />,
          },
        ].map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
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
                {stat.icon}
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
        <Stack direction="row" spacing={1} alignItems="center">
          {error && (
            <Chip
              label="Service registry unreachable"
              size="small"
              sx={{
                bgcolor: "#fef2f2",
                color: "#ef4444",
                fontWeight: 600,
              }}
            />
          )}
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
      </Stack>

      {/* Service cards */}
      <Grid container spacing={3}>
        {services.map((service) => {
          const status = getStatus(service.eurekaName);
          const statusColor =
            status === "LOADING"
              ? STATUS_COLORS.UNKNOWN
              : STATUS_COLORS[status] ?? STATUS_COLORS.UNKNOWN;
          const statusLabel =
            status === "LOADING" ? "Checking…" : status === "UP" ? "Online" : "Offline";

          return (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={service.label}
            >
              <Link href={service.href} style={{ textDecoration: "none" }}>
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
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        lineHeight: 1.3,
                      }}
                    >
                      {service.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Manage
                    </Typography>
                  </Box>
                  {/* Status indicator */}
                  <Tooltip title={statusLabel} arrow>
                    {status === "LOADING" ? (
                      <CircularProgress size={14} thickness={5} />
                    ) : (
                      <CircleIcon
                        sx={{
                          fontSize: 14,
                          color: statusColor,
                          filter: status === "UP" ? `drop-shadow(0 0 4px ${statusColor})` : "none",
                        }}
                      />
                    )}
                  </Tooltip>
                </Paper>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
