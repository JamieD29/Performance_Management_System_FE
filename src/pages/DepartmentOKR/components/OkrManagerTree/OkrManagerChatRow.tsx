import React from "react";
import { TableRow, TableCell, Box, Typography, TextField, Button } from "@mui/material";
import { Send } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface OkrManagerChatRowProps {
  itemId: string;
  colSpan: number;
  activeChatId: string | null;
  proposedChanges: any;
  localComments: Record<string, any[]>;
  chatMessage: string;
  setChatMessage: (val: string) => void;
  chatLoading: boolean;
  handleSendChat: (itemId: string) => void;
}

export const OkrManagerChatRow: React.FC<OkrManagerChatRowProps> = ({
  itemId,
  colSpan,
  activeChatId,
  proposedChanges,
  localComments,
  chatMessage,
  setChatMessage,
  chatLoading,
  handleSendChat,
}) => {
  const { t, i18n } = useTranslation();

  if (activeChatId !== itemId) return null;

  const history = [
    ...(proposedChanges?.[itemId] || []),
    ...(localComments[itemId] || []),
  ];

  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ p: 0, bgcolor: "#f1f5f9" }}>
        <Box
          sx={{
            p: 2,
            borderLeft: "3px solid #f59e0b",
            ml: 2,
            bgcolor: "#fff",
            mb: 2,
            mt: 1,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, color: "#92400e" }}>
            {t("departmentOkr.managerTree.chat.title")}
          </Typography>
          {history.length > 0 ? (
            <Box sx={{ mb: 2, maxHeight: 150, overflowY: "auto" }}>
              {history.map((msg: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 1,
                    p: 1,
                    bgcolor: msg.sender === "USER" ? "#eff6ff" : "#fff7ed",
                    borderRadius: 1,
                    maxWidth: "80%",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color={msg.sender === "USER" ? "primary" : "warning.main"}
                  >
                    {msg.sender === "USER"
                      ? t("departmentOkr.managerTree.chat.senderUser")
                      : t("departmentOkr.managerTree.chat.senderManager")}{" "}
                    -{" "}
                    {new Date(msg.createdAt).toLocaleString(
                      i18n.language === "vi" ? "vi-VN" : "en-US"
                    )}
                  </Typography>
                  <Typography variant="body2">{msg.message}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("departmentOkr.managerTree.chat.noExchange")}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder={t("departmentOkr.managerTree.chat.inputPlaceholder")}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendChat(itemId);
              }}
            />
            <Button
              variant="contained"
              color="warning"
              disabled={chatLoading || !chatMessage.trim()}
              onClick={() => handleSendChat(itemId)}
              startIcon={<Send />}
            >
              {t("departmentOkr.managerTree.chat.sendBtn")}
            </Button>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};
