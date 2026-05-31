import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Chip
} from "@mui/material";
import { Notifications, Circle } from "@mui/icons-material";
import { api } from "../../services/api";
import dayjs from "dayjs";

interface NotificationItem {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [visibleCount, setVisibleCount] = useState(20);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await api.get("/notifications/all");
      const data: NotificationItem[] = Array.isArray(res.data) ? res.data : [];
      // Sắp xếp mới nhất lên đầu
      setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setVisibleCount(20);
  };

  const getNotificationLink = (message: string): string => {
    const msg = message.toLowerCase();

    // 0. Phản hồi đàm phán từ quản lý gửi ngược về cho nhân viên thường
    if (msg.includes("người giao okr") && (msg.includes("đã phản hồi") || msg.includes("phản hồi yêu cầu"))) {
      return "/my-okr";
    }

    // 1. Phân hệ duyệt dành cho Quản lý / Trưởng khoa / Admin
    if (
      msg.includes("yêu cầu xét duyệt") || 
      msg.includes("đề xuất điều chỉnh") ||
      msg.includes("đã gửi đề xuất") ||
      msg.includes("gửi đề xuất okr") ||
      msg.includes("đã phản hồi đề xuất") ||
      msg.includes("phản hồi đề xuất") ||
      msg.includes("đồng ý chấp nhận") ||
      msg.includes("chấp nhận okr")
    ) {
      localStorage.setItem("department_okr_tab", "2"); // Chuyển thẳng tới Tab "Duyệt đề xuất"
      return "/departments/okr";
    }
    if (msg.includes("tự khai điểm okr") || msg.includes("tự khai điểm")) {
      localStorage.setItem("department_okr_tab", "3"); // Chuyển thẳng tới Tab "Tự khai điểm"
      return "/departments/okr";
    }
    if (msg.includes("tự đánh giá") || msg.includes("nộp phiếu tự đánh giá")) {
      localStorage.setItem("department_okr_tab", "4"); // Chuyển thẳng tới Tab "Duyệt phiếu đánh giá"
      return "/departments/okr";
    }

    // 2. Phân hệ cá nhân dành cho nhân sự thường
    if (msg.includes("giao") && msg.includes("okr")) return "/my-okr";
    if (msg.includes("phê duyệt") || msg.includes("đề xuất")) return "/my-okr";
    if (msg.includes("chức vụ") || msg.includes("role")) return "/profile";
    if (msg.includes("đánh giá") || msg.includes("kỳ")) return "/my-evaluation";
    return "/dashboard";
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    handleClose();
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error(error);
      }
    }
    const targetUrl = getNotificationLink(notif.message);
    navigate(targetUrl);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await Promise.all(unreadIds.map(id => api.patch(`/notifications/${id}/read`)));
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch(err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayedNotifications = notifications.filter(n => filter === "ALL" ? true : !n.isRead);

  return (
    <>
      <IconButton 
        onClick={handleOpen} 
        sx={{ 
          mr: 2, 
          bgcolor: "#f8fafc",
          border: "1px solid #e2e8f0",
          "&:hover": { bgcolor: "#f1f5f9" },
          width: 40,
          height: 40
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications sx={{ color: "#64748b" }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 380,
            maxHeight: 520,
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column"
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#ffffff" }}>
          <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem", color: "#3b82f6" }} onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Box>

        <Box sx={{ px: 2, pb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip 
              label="Tất cả" 
              clickable 
              onClick={() => { setFilter("ALL"); setVisibleCount(20); }}
              sx={{ 
                height: 28,
                fontWeight: 600, 
                fontSize: "0.8rem",
                bgcolor: filter === "ALL" ? "#eff6ff" : "#f1f5f9", 
                color: filter === "ALL" ? "#1d4ed8" : "#64748b",
                border: filter === "ALL" ? "1px solid #bfdbfe" : "1px solid transparent",
                "&:hover": { bgcolor: filter === "ALL" ? "#dbeafe" : "#e2e8f0" }
              }} 
            />
            <Chip 
              label="Chưa đọc" 
              clickable 
              onClick={() => { setFilter("UNREAD"); setVisibleCount(20); }}
              sx={{ 
                height: 28,
                fontWeight: 600, 
                fontSize: "0.8rem",
                bgcolor: filter === "UNREAD" ? "#eff6ff" : "#f1f5f9", 
                color: filter === "UNREAD" ? "#1d4ed8" : "#64748b",
                border: filter === "UNREAD" ? "1px solid #bfdbfe" : "1px solid transparent",
                "&:hover": { bgcolor: filter === "UNREAD" ? "#dbeafe" : "#e2e8f0" }
              }} 
            />
          </Box>
        </Box>
        
        <List sx={{ p: 0, overflowY: "auto", flex: 1 }}>
          {displayedNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Notifications sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
              <Typography color="text.secondary" variant="body2" fontWeight={500}>
                {filter === "UNREAD" ? "Bạn không có thông báo chưa đọc nào" : "Không có thông báo nào"}
              </Typography>
            </Box>
          ) : (
            <>
              {displayedNotifications.slice(0, visibleCount).map((notif) => (
                <Box key={notif.id}>
                  <ListItem 
                    onClick={() => handleNotificationClick(notif)}
                    sx={{ 
                      cursor: "pointer",
                      bgcolor: notif.isRead ? "transparent" : "#eff6ff",
                      transition: "background 0.3s ease",
                      alignItems: "flex-start",
                      pt: 1.5,
                      pb: 1.5,
                      "&:hover": { bgcolor: notif.isRead ? "#f8fafc" : "#e0f2fe" }
                    }}
                  >
                    <ListItemText 
                      primary={notif.message} 
                      secondary={dayjs(notif.createdAt).format("DD/MM/YYYY HH:mm")}
                      primaryTypographyProps={{ 
                        variant: "body2", 
                        fontWeight: notif.isRead ? 500 : 700,
                        color: notif.isRead ? "#475569" : "#0f172a",
                        lineHeight: 1.4
                      }}
                      secondaryTypographyProps={{
                        variant: "caption",
                        color: "#94a3b8",
                        mt: 0.5,
                        display: "block"
                      }}
                    />
                    {!notif.isRead && (
                      <Circle sx={{ fontSize: 10, color: "#3b82f6", mt: 0.5, ml: 1, flexShrink: 0 }} />
                    )}
                  </ListItem>
                  <Divider />
                </Box>
              ))}
              {visibleCount < displayedNotifications.length && (
                <Box sx={{ p: 1.5, textAlign: "center" }}>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => setVisibleCount((prev) => prev + 20)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      color: "#2563eb",
                      "&:hover": { bgcolor: "#eff6ff" }
                    }}
                  >
                    Xem thêm thông báo trước đó
                  </Button>
                </Box>
              )}
            </>
          )}
        </List>
      </Popover>
    </>
  );
}
