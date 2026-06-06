export const DRAWER_WIDTH = 280;
export const COLLAPSED_DRAWER_WIDTH = 72;

export const TRANSITION_DURATION = "0.35s";
export const TRANSITION_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
export const SMOOTH_TRANSITION = `all ${TRANSITION_DURATION} ${TRANSITION_EASING}`;

export const colors = {
  bg: "#0F2854",
  bgLight: "#1C4D8D",
  bgDark: "#081736",
  accent1: "#1C4D8D",
  accent2: "#BDE8F5",
  accent3: "#BDE8F5",
  accent4: "#FFD60A",
  text: "rgba(255, 255, 255, 0.88)",
  textMuted: "rgba(255, 255, 255, 0.55)",
  textBright: "#ffffff",
  divider: "rgba(255, 255, 255, 0.15)",
  hoverBg: "rgba(255, 255, 255, 0.12)",
  activeBg: "rgba(255, 255, 255, 0.2)",
  activeGlow: "0 2px 12px rgba(0, 0, 0, 0.15)",
};

export const getItemStyles = (collapsed: boolean, active: boolean) => ({
  borderRadius: "12px",
  minHeight: 46,
  mb: 0.5,
  mx: 0.5,
  px: collapsed ? 1.5 : 2,
  justifyContent: collapsed ? "center" : "flex-start",
  color: active ? colors.textBright : colors.text,
  bgcolor: active ? colors.activeBg : "transparent",
  boxShadow: active ? colors.activeGlow : "none",
  fontWeight: active ? 600 : 400,
  transition: SMOOTH_TRANSITION,
  position: "relative" as const,
  overflow: "hidden",
  "&:hover": {
    bgcolor: active ? colors.activeBg : colors.hoverBg,
    color: colors.textBright,
    transform: collapsed ? "none" : "translateX(3px)",
    "& .MuiListItemIcon-root": {
      color: colors.textBright,
    },
  },
  "&::before": active
    ? {
        content: '""',
        position: "absolute",
        left: 0,
        top: "15%",
        bottom: "15%",
        width: "3px",
        borderRadius: "0 4px 4px 0",
        bgcolor: colors.accent3,
        boxShadow: `0 0 8px ${colors.accent3}`,
      }
    : {},
});

export const getIconStyles = (collapsed: boolean, active: boolean) => ({
  color: active ? "#0F2854" : colors.accent2,
  minWidth: collapsed ? "unset" : 38,
  mr: collapsed ? 0 : 1,
  transition: `color ${TRANSITION_DURATION} ease`,
});

export const groupHeaderStyles = (collapsed: boolean) => ({
  borderRadius: "12px",
  mb: 0.5,
  mx: 0.5,
  px: collapsed ? 1.5 : 2,
  justifyContent: collapsed ? "center" : "flex-start",
  color: colors.textBright,
  transition: SMOOTH_TRANSITION,
  "&:hover": {
    bgcolor: colors.hoverBg,
  },
});

export const sectionLabelSx = (collapsed: boolean) => ({
  display: collapsed ? "none" : "block",
  px: 2,
  pt: 2.5,
  pb: 0.5,
  fontSize: "0.78rem",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: colors.accent2,
});

export const sidebarBg = {
  bgcolor: colors.bg,
  borderRight: "none",
};

export const popoverItemSx = (active: boolean) => ({
  borderRadius: "8px",
  mx: 0.5,
  mb: 0.3,
  color: active ? "#1C4D8D" : "#334155",
  bgcolor: active ? "#e8f0fe" : "transparent",
  fontWeight: active ? 600 : 400,
  transition: "all 0.2s ease",
  "&:hover": {
    bgcolor: "#f1f5f9",
    color: "#1C4D8D",
  },
});
