import { useState, useEffect, useCallback, useRef } from "react";
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
  return <Slide {...props} direction="left" />;
}

const POLL_INTERVAL = 10000; // 10 giây

export default function NotificationToast() {
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
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ maxWidth: 400, cursor: "pointer" }}
      onClick={() => {
        handleClose();
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
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          bgcolor: "#1e3a8a",
          "& .MuiAlert-icon": { color: "#93c5fd" },
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: 14 }}>
          Thông báo mới
        </AlertTitle>
        <Typography variant="body2" sx={{ opacity: 0.95, fontSize: 13 }}>
          {currentNotification.message}
        </Typography>
        {notifications.length > 1 && (
          <Typography
            variant="caption"
            sx={{ opacity: 0.7, mt: 0.5, display: "block" }}
          >
            +{notifications.length - 1} thông báo khác
          </Typography>
        )}
      </Alert>
    </Snackbar>
  );
}
