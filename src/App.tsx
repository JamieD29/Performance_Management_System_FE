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

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
