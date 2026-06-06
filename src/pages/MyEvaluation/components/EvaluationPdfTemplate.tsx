import { useTranslation } from "react-i18next";

interface EvaluationPdfTemplateProps {
  user: any;
  form: any;
  selfComment: string;
  selfRating: string;
}

export default function EvaluationPdfTemplate({
  user,
  form,
  selfComment,
  selfRating,
}: EvaluationPdfTemplateProps) {
  const { t } = useTranslation();

  return (
    <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
      <div
        id="evaluation-form-pdf"
        style={{
          width: "794px",
          padding: "50px 60px",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        {/* Quốc hiệu & Tiêu ngữ */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "none", marginBottom: "30px" }}>
          <tbody>
            <tr style={{ border: "none" }}>
              <td style={{ width: "55%", textAlign: "center", border: "none", verticalAlign: "top", padding: 0 }}>
                <span style={{ textTransform: "uppercase", fontSize: "13px", fontWeight: "bold" }}>
                  {t("evaluationPdfTemplate.countryHeader.republic")}
                </span>
                <br />
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                  {t("evaluationPdfTemplate.countryHeader.slogan")}
                </span>
                <div style={{ margin: "5px auto 0 auto", width: "150px", borderTop: "1px solid #000" }}></div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tiêu đề */}
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <h2 style={{ textTransform: "uppercase", fontSize: "16px", fontWeight: "bold", margin: "0 0 5px 0" }}>
            {t("evaluationPdfTemplate.title")}
          </h2>
          <em style={{ fontSize: "14px" }}>
            {t("evaluationPdfTemplate.cycleLabel", { cycle: form?.cycle?.name || t("evaluationPdfTemplate.defaultCycle") })}
          </em>
        </div>

        {/* PHẦN I: THÔNG TIN CÁ NHÂN */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ textTransform: "uppercase", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            {t("evaluationPdfTemplate.personalInfo.title")}
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "none" }}>
            <tbody>
              <tr style={{ border: "none" }}>
                <td style={{ border: "none", padding: "4px 0", width: "50%" }}>
                  <strong>{t("evaluationPdfTemplate.personalInfo.fullName")}</strong> {user.name}
                </td>
                <td style={{ border: "none", padding: "4px 0", width: "50%" }}>
                  <strong>{t("evaluationPdfTemplate.personalInfo.staffCode")}</strong> {user.staffCode || "N/A"}
                </td>
              </tr>
              <tr style={{ border: "none" }}>
                <td style={{ border: "none", padding: "4px 0" }}>
                  <strong>{t("evaluationPdfTemplate.personalInfo.email")}</strong> {user.email}
                </td>
                <td style={{ border: "none", padding: "4px 0" }}>
                  <strong>{t("evaluationPdfTemplate.personalInfo.department")}</strong> {user.department?.name || "N/A"}
                </td>
              </tr>
              <tr style={{ border: "none" }}>
                <td colSpan={2} style={{ border: "none", padding: "4px 0" }}>
                  <strong>{t("evaluationPdfTemplate.personalInfo.position")}</strong> {user.managementPosition?.name || t("evaluationPdfTemplate.personalInfo.defaultPosition")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PHẦN II: KẾT QUẢ ĐÁNH GIÁ NHIỆM VỤ (OKR) */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ textTransform: "uppercase", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            {t("evaluationPdfTemplate.okrResults.title")}
          </h3>
          {form?.okrObjectiveName && (
            <div style={{ fontStyle: "italic", marginBottom: "8px" }}>
              {t("evaluationPdfTemplate.okrResults.appliedModel", { name: form.okrObjectiveName })}
            </div>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", width: "8%" }}>{t("evaluationPdfTemplate.okrResults.headers.no")}</th>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "left", width: "52%" }}>{t("evaluationPdfTemplate.okrResults.headers.criteria")}</th>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", width: "12%" }}>{t("evaluationPdfTemplate.okrResults.headers.maxScore")}</th>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", width: "14%" }}>{t("evaluationPdfTemplate.okrResults.headers.selfScore")}</th>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", width: "14%" }}>{t("evaluationPdfTemplate.okrResults.headers.managerScore")}</th>
              </tr>
            </thead>
            <tbody>
              {form?.evaluationData?.map((row: any, i: number) => (
                <tr key={row.id || i}>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>{row.id}</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{row.name}</td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{row.maxScore || 0}</td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{row.selfScore?.toFixed(1) || 0}</td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                    {row.principalScore != null ? row.principalScore.toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                <td colSpan={2} style={{ border: "1px solid #000", padding: "8px", textAlign: "center", textTransform: "uppercase" }}>{t("evaluationPdfTemplate.okrResults.totalScore")}</td>
                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>100</td>
                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{form?.selfScoreTotal?.toFixed(1) || 0}</td>
                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
                  {form?.principalScoreTotal != null ? form.principalScoreTotal.toFixed(1) : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PHẦN III: TỰ NHẬN XẾP LOẠI CHẤT LƯỢNG */}
        <div style={{ marginBottom: "25px", pageBreakBefore: "always", paddingTop: "30px" }}>
          <h3 style={{ textTransform: "uppercase", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            {t("evaluationPdfTemplate.selfComment.title")}
          </h3>
          <div style={{ marginBottom: "10px" }}>
            <strong>{t("evaluationPdfTemplate.selfComment.commentLabel")}</strong>
            <p style={{ margin: "5px 0 15px 15px", whiteSpace: "pre-wrap", textAlign: "justify" }}>
              {selfComment || t("evaluationPdfTemplate.selfComment.noComment")}
            </p>
          </div>
          <div>
            <strong>{t("evaluationPdfTemplate.selfComment.ratingLabel")}</strong>
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {selfRating === "EXCELLENT" && t("evaluationPdfTemplate.selfComment.ratings.excellent")}
              {selfRating === "GOOD" && t("evaluationPdfTemplate.selfComment.ratings.good")}
              {selfRating === "POOR" && t("evaluationPdfTemplate.selfComment.ratings.poor")}
              {!selfRating && t("evaluationPdfTemplate.selfComment.ratings.unrated")}
            </span>
          </div>
        </div>

        {/* PHẦN IV: ĐÁNH GIÁ, XẾP LOẠI (QUẢN LÝ) */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ textTransform: "uppercase", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            {t("evaluationPdfTemplate.managerComment.title")}
          </h3>
          <div style={{ marginBottom: "10px" }}>
            <strong>{t("evaluationPdfTemplate.managerComment.commentLabel")}</strong>
            <p style={{ margin: "5px 0 15px 15px", whiteSpace: "pre-wrap", textAlign: "justify" }}>
              {form?.managerComment || t("evaluationPdfTemplate.managerComment.noComment")}
            </p>
          </div>
          <div>
            <strong>{t("evaluationPdfTemplate.managerComment.ratingLabel")}</strong>
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {form?.managerRating === "EXCELLENT" && t("evaluationPdfTemplate.managerComment.ratings.excellent")}
              {form?.managerRating === "GOOD" && t("evaluationPdfTemplate.managerComment.ratings.good")}
              {form?.managerRating === "POOR" && t("evaluationPdfTemplate.managerComment.ratings.poor")}
              {!form?.managerRating && t("evaluationPdfTemplate.managerComment.ratings.unrated")}
            </span>
          </div>
        </div>

        {/* KÝ TÊN */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "none", marginTop: "30px" }}>
          <tbody>
            <tr style={{ border: "none" }}>
              <td style={{ width: "50%", textAlign: "center", border: "none", padding: 0, verticalAlign: "top" }}>
                <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>{t("evaluationPdfTemplate.signatures.employee")}</span>
                <br />
                <em style={{ fontSize: "12px" }}>{t("evaluationPdfTemplate.signatures.instruction")}</em>
                <br />
                <br />
                <br />
                <br />
                <span style={{ fontWeight: "bold" }}>{user.name}</span>
              </td>
              <td style={{ width: "50%", textAlign: "center", border: "none", padding: 0, verticalAlign: "top" }}>
                <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>{t("evaluationPdfTemplate.signatures.supervisor")}</span>
                <br />
                <em style={{ fontSize: "12px" }}>{t("evaluationPdfTemplate.signatures.instruction")}</em>
                <br />
                <br />
                <br />
                <br />
                <span style={{ fontWeight: "bold" }}>....................................................</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
