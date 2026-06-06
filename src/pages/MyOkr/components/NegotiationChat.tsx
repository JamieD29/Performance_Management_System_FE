import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  TextField,
  Button,
  TableRow,
  TableCell,
} from "@mui/material";
import { Send } from "@mui/icons-material";

interface NegotiationChatProps {
  itemId: string;
  activeChatId: string | null;
  history: any[];
  chatMessage: string;
  setChatMessage: (val: string) => void;
  onSend: (itemId: string) => void;
  loading: boolean;
  colSpan: number;
  status: string;
}

const NegotiationChat: React.FC<NegotiationChatProps> = ({
  itemId,
  activeChatId,
  history,
  chatMessage,
  setChatMessage,
  onSend,
  loading,
  colSpan,
  status,
}) => {
  const { t, i18n } = useTranslation();
  if (activeChatId !== itemId) return null;

  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ p: 0, bgcolor: "#f1f5f9" }}>
        <Box sx={{ p: 2, borderLeft: "3px solid #3b82f6", ml: 2, bgcolor: "#fff", mb: 2, mt: 1, borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "#1e3a8a" }}>
            {t("okrCard.chat.exchangeTitle")}
          </Typography>
          {history.length > 0 ? (
            <Box sx={{ mb: 2, maxHeight: 150, overflowY: "auto" }}>
              {history.map((msg: any, idx: number) => (
                <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: msg.sender === 'USER' ? '#eff6ff' : '#fff7ed', borderRadius: 1, maxWidth: "80%" }}>
                  <Typography variant="caption" fontWeight="bold" color={msg.sender === 'USER' ? 'primary' : 'warning.main'}>
                    {msg.sender === 'USER' ? t("okrCard.chat.senderUser") : t("okrCard.chat.senderManager")} - {new Date(msg.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                  </Typography>
                  <Typography variant="body2">{msg.message}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("okrCard.chat.noExchangeDesc")}
            </Typography>
          )}

          {(status === 'PENDING' || status === 'NEGOTIATING') && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder={t("okrCard.chat.inputPlaceholder")}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSend(itemId); }}
              />
              <Button
                variant="contained"
                disabled={loading || !chatMessage.trim()}
                onClick={() => onSend(itemId)}
                startIcon={<Send />}
              >
                {t("okrCard.chat.sendBtn")}
              </Button>
            </Box>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default NegotiationChat;
