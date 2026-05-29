import { Box, Paper, Typography, Avatar, Chip, alpha } from "@mui/material";
import { Email, Work, Business, Person, School, Badge, CalendarToday, VerifiedUser } from "@mui/icons-material";
import type { User } from "../../../types";
import { THEME_COLORS } from "../../ProfileSetting/profile.constants";

interface UserProfileCardProps {
  user: User;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const mainColor = THEME_COLORS.IDENTITY;

  // Component nhỏ để hiển thị các thông tin phụ
  const InfoBadge = ({ icon, text, colorBg }: any) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 0.8,
        px: 1.5,
        borderRadius: "30px",
        bgcolor: colorBg,
        color: "#475569",
        fontWeight: 600,
        fontSize: "0.875rem",
        border: "1px solid",
        borderColor: alpha(colorBg, 0.5),
      }}
    >
      {icon}
      {text}
    </Box>
  );

  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: "24px",
        p: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        position: "relative",
        background: "linear-gradient(145deg, #ffffff, #f8fafc)",
        boxShadow: "0 10px 30px -5px rgba(0,0,0,0.1)",
        overflow: "visible",
      }}
    >
      {/* --- KHU VỰC AVATAR --- */}
      <Box
        sx={{
          position: "relative",
          mb: { xs: 3, md: 0 },
          mr: { md: 5 },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: "50%",
            p: "6px",
            background: `linear-gradient(135deg, ${alpha(mainColor, 0.8)}, ${alpha(THEME_COLORS.WORK, 0.5)})`,
            boxShadow: `0 8px 20px -5px ${alpha(mainColor, 0.5)}`,
          }}
        >
          <Avatar
            src={user.avatarUrl}
            sx={{
              width: { xs: 120, md: 150 },
              height: { xs: 120, md: 150 },
              border: "4px solid white",
              bgcolor: mainColor,
              fontSize: { xs: 50, md: 60 },
              fontWeight: "bold",
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Avatar>
        </Box>
      </Box>

      {/* --- KHU VỰC THÔNG TIN CHÍNH --- */}
      <Box
        sx={{
          flexGrow: 1,
          textAlign: { xs: "center", md: "left" },
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{ color: "#1e293b", letterSpacing: "-0.5px" }}
          >
            {user.name}
          </Typography>
          {/* <VerifiedUser sx={{ color: mainColor }} /> */}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: { xs: "center", md: "flex-start" },
            alignItems: "center",
            flexWrap: "wrap",
            mt: 2,
          }}
        >
          <InfoBadge
            icon={<Email fontSize="small" sx={{ color: mainColor }} />}
            text={user.email}
            colorBg={alpha(mainColor, 0.08)}
          />
          <InfoBadge
            icon={<Badge fontSize="small" sx={{ color: THEME_COLORS.WORK }} />}
            text={user.staffCode || "Chưa có mã NV"}
            colorBg={alpha(THEME_COLORS.WORK, 0.08)}
          />
          <InfoBadge
            icon={<Business fontSize="small" sx={{ color: THEME_COLORS.ACHIEVEMENT }} />}
            text={user.department?.name || "Chưa phân bổ"}
            colorBg={alpha(THEME_COLORS.ACHIEVEMENT, 0.08)}
          />
        </Box>

        {/* Các thông tin phụ */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            justifyContent: { xs: "center", md: "flex-start" },
            flexWrap: "wrap",
            mt: 3,
            pt: 2,
            borderTop: "1px dashed #e2e8f0"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Work sx={{ color: "#94a3b8", fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Chức danh: <Typography component="span" fontWeight={500} color="#1e293b">{user.jobTitle || "N/A"}</Typography>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Person sx={{ color: "#94a3b8", fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Chức vụ: <Typography component="span" fontWeight={500} color="#1e293b">{user.managementPosition?.name || "N/A"}</Typography>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <School sx={{ color: "#94a3b8", fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Học vị/Học hàm: <Typography component="span" fontWeight={500} color="#1e293b">{user.degree || "N/A"} {user.academicRank && user.academicRank !== "Không" ? ` - ${user.academicRank}` : ""}</Typography>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarToday sx={{ color: "#94a3b8", fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Ngày vào: <Typography component="span" fontWeight={500} color="#1e293b">{user.joinDate ? new Date(user.joinDate).toLocaleDateString("vi-VN") : "N/A"}</Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
