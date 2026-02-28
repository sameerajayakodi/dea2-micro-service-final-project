"use client";

import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MenuIcon from "@mui/icons-material/Menu";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import PeopleIcon from "@mui/icons-material/People";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer as MuiDrawer,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const drawerWidth = 270;
const collapsedWidth = 72;

const navItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  {
    label: "Customer Service",
    path: "/customer_service",
    icon: <PeopleIcon />,
  },
  {
    label: "Dispatch Service",
    path: "/dispatch_service",
    icon: <LocalShippingIcon />,
  },
  {
    label: "Inbound Service",
    path: "/inbound_service",
    icon: <MoveToInboxIcon />,
  },
  {
    label: "Inventory Service",
    path: "/inventory_service",
    icon: <InventoryIcon />,
  },
  {
    label: "Order Service",
    path: "/order_service",
    icon: <ShoppingCartIcon />,
  },
  {
    label: "Picking Service",
    path: "/picking_service",
    icon: <PlaylistAddCheckIcon />,
  },
  {
    label: "Product Service",
    path: "/product_service",
    icon: <CategoryIcon />,
  },
  {
    label: "Storage Service",
    path: "/storage_service",
    icon: <WarehouseIcon />,
  },
  {
    label: "Supplier Service",
    path: "/supplier_service",
    icon: <BusinessIcon />,
  },
  {
    label: "Workforce Service",
    path: "/workforce_service",
    icon: <BadgeIcon />,
  },
];

/* Styled drawer that animates open/close */
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
  color: "#e0e7ff",
  borderRight: "none",
});

const closedMixin = (theme) => ({
  width: collapsedWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
  color: "#e0e7ff",
  borderRight: "none",
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleToggle = () => setOpen(!open);
  const handleMobileToggle = () => setMobileOpen(!mobileOpen);

  const drawerContent = (isOpen) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          px: isOpen ? 2.5 : 1,
          py: 2,
          minHeight: 64,
        }}
      >
        {isOpen && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(99, 102, 241, 0.3)",
                width: 36,
                height: 36,
              }}
            >
              <WarehouseIcon sx={{ fontSize: 20, color: "#a5b4fc" }} />
            </Avatar>
            <Typography
              variant="h6"
              noWrap
              sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}
            >
              Warehouse
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={handleToggle}
          sx={{
            color: "#c7d2fe",
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />

      {/* Nav links */}
      <List sx={{ px: 1, py: 1.5, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem
              key={item.label}
              disablePadding
              sx={{ display: "block", mb: 0.3 }}
            >
              <Tooltip title={isOpen ? "" : item.label} placement="right" arrow>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    router.push(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    minHeight: 46,
                    justifyContent: isOpen ? "initial" : "center",
                    px: 2,
                    borderRadius: 2,
                    mx: 0.5,
                    color: "#c7d2fe",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.06)",
                    },
                    "&.Mui-selected": {
                      bgcolor: "rgba(99, 102, 241, 0.35)",
                      color: "#fff",
                      backdropFilter: "blur(8px)",
                      "& .MuiListItemIcon-root": { color: "#fff" },
                      "&:hover": {
                        bgcolor: "rgba(99, 102, 241, 0.45)",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isOpen ? 2 : "auto",
                      justifyContent: "center",
                      color: isActive ? "#fff" : "#a5b4fc",
                      fontSize: 20,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 400,
                    }}
                    sx={{ opacity: isOpen ? 1 : 0 }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const currentWidth = open ? drawerWidth : collapsedWidth;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${currentWidth}px)` },
          ml: { sm: `${currentWidth}px` },
          bgcolor: alpha("#ffffff", 0.8),
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleMobileToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{ fontWeight: 600, fontSize: "1.1rem" }}
          >
            Warehouse Management System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
            color: "#e0e7ff",
            border: "none",
          },
        }}
      >
        {drawerContent(true)}
      </MuiDrawer>

      {/* Desktop Drawer — toggleable */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {drawerContent(open)}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${currentWidth}px)` },
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
