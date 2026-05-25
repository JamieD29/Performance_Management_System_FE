import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes"; // Bỏ đuôi .tsx khi import
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import "./App.css";

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = `${t("sidebar.vnuHcmus")} - ${t("common.systemName")}`;
  }, [i18n.language, t]);

  // Sync session state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken") {
        if (e.newValue) {
          // Token updated/changed in another tab (e.g. logged in with different user)
          window.location.reload();
        } else {
          // Token removed in another tab (logged out)
          window.location.href = "/login";
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
