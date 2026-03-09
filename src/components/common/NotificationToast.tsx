import { useState, useEffect, useCallback } from 'react';
import {
    Snackbar,
    Alert,
    AlertTitle,
    IconButton,
    Typography,
    Slide,
} from '@mui/material';
import type { SlideProps } from '@mui/material';
import { Close, NotificationsActive } from '@mui/icons-material';
import { api } from '../../services/api';

interface NotificationItem {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="left" />;
}

const POLL_INTERVAL = 30000; // 30 giây

export default function NotificationToast() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
    const [open, setOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            if (!token) return; // Chưa đăng nhập thì không poll

            const res = await api.get('/notifications');
            const data: NotificationItem[] = Array.isArray(res.data) ? res.data : [];

            if (data.length > 0) {
                setNotifications(data);
                // Hiển thị thông báo mới nhất chưa xem
                const newest = data[0];
                if (!currentNotification || newest.id !== currentNotification.id) {
                    setCurrentNotification(newest);
                    setOpen(true);
                }
            }
        } catch (error) {
            // Silently fail — notification polling không nên crash app
        }
    }, [currentNotification]);

    // Poll API định kỳ
    useEffect(() => {
        fetchNotifications(); // Lần đầu

        const interval = setInterval(fetchNotifications, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleClose = async () => {
        setOpen(false);
        if (currentNotification) {
            try {
                await api.patch(`/notifications/${currentNotification.id}/read`);
                // Gỡ khỏi danh sách
                setNotifications((prev) => prev.filter((n) => n.id !== currentNotification.id));
            } catch (error) {
                // Silently fail
            }
        }
    };

    // Hiển thị notification kế tiếp khi đóng cái hiện tại
    const handleExited = () => {
        const remaining = notifications.filter((n) => n.id !== currentNotification?.id);
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
            onClose={handleClose}
            TransitionComponent={SlideTransition}
            TransitionProps={{ onExited: handleExited }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{ maxWidth: 400 }}
        >
            <Alert
                severity="info"
                variant="filled"
                icon={<NotificationsActive />}
                action={
                    <IconButton size="small" color="inherit" onClick={handleClose}>
                        <Close fontSize="small" />
                    </IconButton>
                }
                sx={{
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    bgcolor: '#1e3a8a',
                    '& .MuiAlert-icon': { color: '#93c5fd' },
                    '& .MuiAlert-message': { width: '100%' },
                }}
            >
                <AlertTitle sx={{ fontWeight: 700, fontSize: 14 }}>
                    Thông báo mới
                </AlertTitle>
                <Typography variant="body2" sx={{ opacity: 0.95, fontSize: 13 }}>
                    {currentNotification.message}
                </Typography>
                {notifications.length > 1 && (
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                        +{notifications.length - 1} thông báo khác
                    </Typography>
                )}
            </Alert>
        </Snackbar>
    );
}
