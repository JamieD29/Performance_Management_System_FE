import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  List,
  Divider,
  Paper,
  ListItemButton,
  ListItemIcon,
  Container,
  ListItemText,
} from "@mui/material";
import {
  Dns,
  People,
  History,
  AdminPanelSettings,
  ArrowBack,
  CalendarToday,
  Settings,
} from "@mui/icons-material";
import type { User } from "../../types";
import CycleManagement from "../Performance/components/CycleManagement";
import WhitelistManager from "./components/WhitelistManager";
import SystemLogs from "./components/SystemLogs";
import RoleManagementTab from "./components/RoleManagementTab";
import SystemResetTab from "./components/SystemResetTab";

export default function AdminSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cycles");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      const user: User = JSON.parse(userInfo);
      const rawRoles = Array.isArray(user.roles) ? user.roles : [];
      const normalizedRoles = rawRoles.map((r: any) =>
        (typeof r === "string" ? r : r?.slug || r?.name || "").toString(),
      );

      const checkSuper = normalizedRoles.includes("ADMIN");
      const checkAccess = normalizedRoles.includes("ADMIN");

      if (!checkAccess) {
        navigate("/dashboard");
        return;
      }
      setIsAdmin(true);
      setIsSuperAdmin(checkSuper);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!isAdmin) return null;

  const menuItems = [
    {
      id: "cycles",
      label: t("adminSettings.tabs.cycles"),
      icon: <CalendarToday />,
      restricted: false,
    },
    {
      id: "whitelist",
      label: t("adminSettings.tabs.whitelist"),
      icon: <Dns />,
      restricted: false,
    },
    { id: "roles", label: t("adminSettings.tabs.roles"), icon: <People />, restricted: true },
    { id: "logs", label: t("adminSettings.tabs.logs"), icon: <History />, restricted: true },
    { id: "system", label: t("adminSettings.tabs.factoryReset"), icon: <Settings />, restricted: true },
  ];

  const availableMenuItems = menuItems.filter(
    (item) => !item.restricted || isSuperAdmin,
  );
  const shouldShowSidebar = isSuperAdmin || availableMenuItems.length > 1;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        minHeight: "85vh",
        bgcolor: "#f8fafc",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* SIDEBAR */}
      {shouldShowSidebar && (
        <Paper
          elevation={0}
          sx={{
            width: 260,
            flexShrink: 0,
            borderRight: "1px solid #e2e8f0",
            bgcolor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}
            >
              <AdminPanelSettings color="primary" />
              <Typography variant="subtitle1" fontWeight="bold" color="#1e3a8a">
                {t("adminSettings.portalTitle")}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t("adminSettings.systemConfig")}
            </Typography>
          </Box>
          <Divider />

          <List sx={{ p: 2, flexGrow: 1 }}>
            <ListItemButton
              onClick={() => navigate("/dashboard")}
              sx={{ mb: 2, borderRadius: 2, bgcolor: "#f1f5f9" }}
            >
              <ListItemIcon>
                <ArrowBack fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t("adminSettings.backDashboard")}
                primaryTypographyProps={{ fontSize: "0.875rem" }}
              />
            </ListItemButton>

            <Typography
              variant="overline"
              sx={{ px: 1, color: "text.secondary", fontWeight: "bold" }}
            >
              {t("adminSettings.modules")}
            </Typography>

            {availableMenuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "#eff6ff",
                    color: "#1e3a8a",
                    "& .MuiListItemIcon-root": { color: "#1e3a8a" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      <Box sx={{ flexGrow: 1, p: 4, bgcolor: "#fff", overflow: "auto" }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
            <Typography variant="h5" fontWeight="bold" color="#1e293b">
              {menuItems.find((i) => i.id === activeTab)?.label}
            </Typography>
          </Box>

          {activeTab === "cycles" && <CycleManagement />}
          {activeTab === "whitelist" && <WhitelistManager />}
          {activeTab === "roles" && <RoleManagementTab />}
          {activeTab === "logs" && <SystemLogs />}
          {activeTab === "system" && <SystemResetTab />}
        </Container>
      </Box>
    </Box>
  );
}
