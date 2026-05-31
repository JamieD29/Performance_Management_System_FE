import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Tabs,
  Tab,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { 
  Building2, 
  FileText, 
  UserPlus, 
  CheckCircle, 
  BarChart3, 
  FileCheck2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TemplateListTab from "./components/TemplateListTab";
import AssignOkrTab from "./components/AssignOkrTab";
import DeanApprovalTab from "./components/DeanApprovalTab";
import EvaluationListTab from "./components/EvaluationListTab";
import EvaluationFormManagerTab from "./components/EvaluationFormManagerTab";

export default function DepartmentOKR() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  // Ưu tiên đọc tab từ URL query param (?tab=N), fallback về localStorage
  const getInitialTab = () => {
    const urlTab = searchParams.get("tab");
    if (urlTab !== null) {
      const idx = parseInt(urlTab, 10);
      if (idx >= 0 && idx < 5) return idx;
    }
    const savedTab = localStorage.getItem("department_okr_tab");
    const index = savedTab ? parseInt(savedTab, 10) : 0;
    return index >= 0 && index < 5 ? index : 0;
  };

  const [tabValue, setTabValue] = useState(getInitialTab);

  // Đồng bộ tab khi URL thay đổi (ví dụ: navigate từ dashboard)
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab !== null) {
      const idx = parseInt(urlTab, 10);
      if (idx >= 0 && idx < 5 && idx !== tabValue) {
        setTabValue(idx);
        localStorage.setItem("department_okr_tab", idx.toString());
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Tab definitions
  const TABS = [
    { labelKey: "departmentOkr.tabs.templates", icon: <FileText size={18} /> },
    { labelKey: "departmentOkr.tabs.assign", icon: <UserPlus size={18} /> },
    { labelKey: "departmentOkr.tabs.approveProposals", icon: <CheckCircle size={18} /> },
    { labelKey: "departmentOkr.tabs.reports", icon: <BarChart3 size={18} /> },
    { labelKey: "departmentOkr.tabs.approveForms", icon: <FileCheck2 size={18} /> },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Typography
          color="inherit"
          sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 500 }}
        >
          <Building2 size={18} />
          {t("departmentOkr.breadcrumbDepartment")}
        </Typography>
        <Typography color="text.primary" fontWeight={600}>{t("departmentOkr.title")}</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h4" fontWeight="800" sx={{
          background: "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          {t("departmentOkr.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("departmentOkr.description")}
        </Typography>
      </Box>

      {/* Styled Tabs */}
      <Box sx={{ 
        mb: 4, 
        bgcolor: "white", 
        p: 0.5, 
        borderRadius: 3, 
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        display: "flex",
        width: "100%",
        overflow: "hidden"
      }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, v) => {
            setTabValue(v);
            localStorage.setItem("department_okr_tab", v.toString());
            // Cập nhật URL param để giữ đồng bộ
            setSearchParams({ tab: v.toString() }, { replace: true });
          }}
          variant="fullWidth"
          TabIndicatorProps={{
            style: { display: "none" } // Ẩn đường kẻ gạch chân mặc định
          }}
          sx={{
            minHeight: 48,
            width: "100%",
            "& .MuiTabs-flexContainer": {
              gap: 1
            }
          }}
        >
          {TABS.map((tab, index) => (
            <Tab 
              key={index}
              disableRipple
              label={
                <Box 
                  sx={{ 
                    position: "relative", 
                    width: "100%", 
                    height: "100%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    py: 1.2,
                    px: 2.5,
                    zIndex: 1
                  }}
                >
                  {tabValue === index && (
                    <motion.div
                      layoutId="activeOkrTabBackground"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                        borderRadius: "10px",
                        zIndex: -1,
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.35)",
                      }}
                      transition={{ type: "tween", ease: "circOut", duration: 0.35 }}
                    />
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, zIndex: 2, position: "relative" }}>
                    {tab.icon}
                    <span>{t(tab.labelKey)}</span>
                  </Box>
                </Box>
              }
              sx={{
                p: 0,
                m: 0,
                minHeight: 44,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: tabValue === index ? 700 : 500,
                fontSize: "0.95rem",
                color: tabValue === index ? "#ffffff" : "#64748b",
                transition: "color 0.2s ease",
                "&:hover": {
                  color: tabValue === index ? "#ffffff" : "#0f172a",
                  bgcolor: tabValue === index ? "transparent" : "#f1f5f9",
                },
                "&.Mui-selected": {
                  color: "#ffffff",
                }
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Framer Motion Tab Panels */}
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 200px)" }}>
        <motion.div
          key={tabValue}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {tabValue === 0 && <TemplateListTab />}
          {tabValue === 1 && <AssignOkrTab />}
          {tabValue === 2 && <DeanApprovalTab />}
          {tabValue === 3 && <EvaluationListTab />}
          {tabValue === 4 && <EvaluationFormManagerTab />}
        </motion.div>
      </Box>
    </Container>
  );
}
