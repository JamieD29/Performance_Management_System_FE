import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout,
  AdminPanelSettings,
  Settings,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  onToggleSidebar: () => void;
  user: any;
  sidebarWidth?: number;
}

export default function Header({
  onToggleSidebar,
  user,
  sidebarWidth = 280,
}: HeaderProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const rawRoles = Array.isArray(user.roles) ? user.roles : [];

  // 2. Normalize Role array (Supports both String and Object)
  const normalizedRoles = rawRoles.map((r: any) =>
    (typeof r === "string" ? r : r?.slug || r?.name || "")
      .toString()
      .toUpperCase(),
  );

  // 3. Check Admin privileges
  const isAdmin = normalizedRoles.includes("ADMIN");

  // Display role: Prioritize ADMIN, followed by management position or job title
  const displayRole = isAdmin
    ? "Admin"
    : user?.managementPosition?.name || user?.jobTitle || "User";

  // Fix Avatar: Supports both 'avatar' (from old session) and 'avatarUrl' (from new API)
  const avatarSrc = user?.avatarUrl || user?.avatar || undefined;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.log("Backend error (ignored)");
    } finally {
      // 1. Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      if (typeof setAnchorEl === "function") setAnchorEl(null);

      // 2. USE SETTIMEOUT TO FORCE REDIRECT DESPITE REACT ERRORS
      setTimeout(() => {
        window.location.href = "/login";
      }, 100); // 0.1s delay to escape the erroring call stack
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#ffffff",
        color: "#1e293b",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        width: { sm: `calc(100% - ${sidebarWidth}px)` },
        ml: { sm: `${sidebarWidth}px` },
        transition:
          "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2, display: { sm: "none" } }} // 🔥 Show Menu button on mobile only. Hidden on desktop as the Sidebar is permanently visible
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#1e3a8a",
          }}
        >
          {t("common.hcmus")}{" "}
          <Typography
            component="span"
            sx={{ color: "#64748b", fontWeight: 400 }}
          >
            | {user?.department?.name || t("common.systemName")}
          </Typography>
        </Typography>

        <Button
          onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            bgcolor: "#f8fafc",
            fontWeight: "bold",
            color: "#1976d2",
            borderColor: "#e2e8f0",
            minWidth: "auto",
            px: 1.5,
            py: 0.5,
            mr: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            "&:hover": {
              bgcolor: "#f1f5f9",
              borderColor: "#cbd5e1",
            }
          }}
        >
          {i18n.language === 'en' ? (
            <>
              <img src="https://flagcdn.com/w20/us.png" width="20" alt="English" style={{ borderRadius: '2px' }} />
              EN
            </>
          ) : (
            <>
              <img src="https://flagcdn.com/w20/vn.png" width="20" alt="Vietnamese" style={{ borderRadius: '2px' }} />
              VN
            </>
          )}
        </Button>

        <NotificationBell />

        <Button
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            textTransform: "none",
            color: "text.primary",
            borderRadius: "50px",
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            p: "4px 16px 4px 6px",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              bgcolor: "#f1f5f9",
              borderColor: "#cbd5e1",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Avatar
            src={avatarSrc}
            sx={{
              width: 38,
              height: 38,
              mr: 1.5,
              border: "2px solid #ffffff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              bgcolor: user?.avatar ? "transparent" : "#3b82f6",
              fontWeight: "bold",
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>

          <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "#1e293b" }}
            >
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", fontWeight: 500, fontSize: "0.7rem" }}
            >
              {displayRole}
            </Typography>
          </Box>
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: "12px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
            },
          }}
        >
          <MenuItem
            onClick={() => navigate("/profile")}
            sx={{
              py: 1.2,
              px: 2,
              borderRadius: "8px",
              mx: 0.5,
              mb: 0.3,
              transition: "all 0.2s ease",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <Settings fontSize="small" sx={{ mr: 1.5, color: "#64748b" }} />
            <Typography variant="body2" fontWeight={500}>
              {t("header.profile")}
            </Typography>
          </MenuItem>
          {isAdmin && (
            <MenuItem
              onClick={() => navigate("/admin/settings")}
              sx={{
                py: 1.2,
                px: 2,
                borderRadius: "8px",
                mx: 0.5,
                mb: 0.3,
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              <AdminPanelSettings
                fontSize="small"
                sx={{ mr: 1.5, color: "#64748b" }}
              />
              <Typography variant="body2" fontWeight={500}>
                {t("header.adminPortal")}
              </Typography>
            </MenuItem>
          )}
          <Divider sx={{ mx: 1, my: 0.5 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2,
              px: 2,
              borderRadius: "8px",
              mx: 0.5,
              color: "#ef4444",
              transition: "all 0.2s ease",
              "&:hover": { bgcolor: "#fef2f2" },
            }}
          >
            <Logout fontSize="small" sx={{ mr: 1.5 }} />
            <Typography variant="body2" fontWeight={500}>
              {t("header.logout")}
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
