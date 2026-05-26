import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Typography,
  Slide,
} from "@mui/material";
import type { SlideProps } from "@mui/material";
import { Close, NotificationsActive } from "@mui/icons-material";
import { api } from "../../services/api";

interface NotificationItem {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

const POLL_INTERVAL = 10000; // 10 giây

export default function NotificationToast() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentNotification, setCurrentNotification] =
    useState<NotificationItem | null>(null);
  const [open, setOpen] = useState(false);

  // Track ID đã dismiss để không hiện lại khi poll
  const dismissedIdsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await api.get("/notifications");
      const data: NotificationItem[] = Array.isArray(res.data) ? res.data : [];

      // Lọc: chưa đọc VÀ chưa bị dismiss trong session này
      const unreadData = data.filter(
        (n) => !n.isRead && !dismissedIdsRef.current.has(n.id),
      );

      if (unreadData.length > 0) {
        setNotifications(unreadData);
        // Chỉ hiện toast nếu chưa đang hiện cái nào
        setCurrentNotification((prev) => {
          if (!prev || dismissedIdsRef.current.has(prev.id)) {
            setOpen(true);
            return unreadData[0];
          }
          return prev;
        });
      } else {
        setNotifications([]);
      }
    } catch (error) {
      // Silently fail — notification polling không nên crash app
    }
  }, []); // Không dependency currentNotification để tránh infinite loop

  // Poll API định kỳ
  useEffect(() => {
    fetchNotifications(); // Lần đầu

    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Đánh dấu đã đọc trên server
  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.warn("Không thể đánh dấu đã đọc:", error);
    }
  };

  const handleClose = async (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);

    // Đánh dấu đã đọc trên server + ghi nhận dismiss local
    if (currentNotification) {
      dismissedIdsRef.current.add(currentNotification.id);
      markAsRead(currentNotification.id);
    }
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
    const targetUrl = getNotificationLink(notif.message);
    navigate(targetUrl);
  };

  // Hiển thị notification kế tiếp khi đóng cái hiện tại
  const handleExited = () => {
    const remaining = notifications.filter(
      (n) =>
        n.id !== currentNotification?.id &&
        !dismissedIdsRef.current.has(n.id),
    );
    if (remaining.length > 0) {
      setCurrentNotification(remaining[0]);
      setOpen(true);
    } else {
      setCurrentNotification(null);
    }
  };

  if (!currentNotification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={8000}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ maxWidth: 400, cursor: "pointer", mt: 2 }}
      onClick={() => {
        handleNotificationClick(currentNotification);
      }}
    >
      <Alert
        severity="info"
        variant="filled"
        icon={<NotificationsActive />}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={(e) => {
              e.stopPropagation(); // Ngăn event bubble lên Snackbar onClick
              handleClose();
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{
          width: "100%",
          borderRadius: "16px",
          bgcolor: "rgba(15, 23, 42, 0.95)", // Slate đậm kết hợp Glassmorphism
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(148, 163, 184, 0.25)", // Viền xám sáng tăng độ nổi bật
          boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.5), 0 0 25px rgba(59, 130, 246, 0.2)", // Đổ bóng kép cực kỳ cao cấp kèm hiệu ứng phát sáng xanh nhẹ
          color: "#f8fafc",
          "& .MuiAlert-icon": { color: "#60a5fa" }, // Icon màu xanh dương tươi sáng
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>
          Thông báo mới
        </AlertTitle>
        <Typography variant="body2" sx={{ opacity: 0.95, fontSize: 13, color: "#f1f5f9" }}>
          {currentNotification.message}
        </Typography>
        {notifications.length > 1 && (
          <Typography
            variant="caption"
            sx={{ opacity: 0.7, mt: 0.5, display: "block", color: "#94a3b8" }}
          >
            +{notifications.length - 1} thông báo khác
          </Typography>
        )}
      </Alert>
    </Snackbar>
  );
}
