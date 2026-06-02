import React from "react";

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
              {/* <td style={{ width: "45%", textAlign: "center", border: "none", verticalAlign: "top", padding: 0 }}>
                <span style={{ textTransform: "uppercase", fontSize: "12px", fontWeight: "bold" }}>
                  {user.department?.name || "ĐƠN VỊ CÔNG TÁC"}
                </span>
                <br />
                <span style={{ fontSize: "12px", fontWeight: "bold", textDecoration: "underline" }}>
                  BỘ PHẬN TỰ ĐÁNH GIÁ
                </span>
              </td> */}
              <td style={{ width: "55%", textAlign: "center", border: "none", verticalAlign: "top", padding: 0 }}>
                <span style={{ textTransform: "uppercase", fontSize: "13px", fontWeight: "bold" }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </span>
                <br />
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                  Độc lập - Tự do - Hạnh phúc
                </span>
                <div style={{ margin: "5px auto 0 auto", width: "150px", borderTop: "1px solid #000" }}></div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tiêu đề */}
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <h2 style={{ textTransform: "uppercase", fontSize: "16px", fontWeight: "bold", margin: "0 0 5px 0" }}>
            BẢN TỰ ĐÁNH GIÁ, XẾP LOẠI CHẤT LƯỢNG VIÊN CHỨC
          </h2>
          <em style={{ fontSize: "14px" }}>
            Kỳ đánh giá: {form?.cycle?.name || "Kỳ mặc định"}
          </em>
        </div>

        {/* PHẦN I: THÔNG TIN CÁ NHÂN */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ textTransform: "uppercase", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            I. THÔNG TIN CÁ NHÂN
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "none" }}>
            <tbody>
              <tr style={{ border: "none" }}>
                <td style={{ border: "none", padding: "4px 0", width: "50%" }}>
                  <strong>1. Họ và tên:</strong> {user.name}
                </td>
                <td style={{ border: "none", padding: "4px 0", width: "50%" }}>
                  <strong>2. Mã số cán bộ (MSCB):</strong> {user.staffCode || "N/A"}
                </td>
              </tr>
              <tr style={{ border: "none" }}>
                <td style={{ border: "none", padding: "4px 0" }}>
                  <strong>3. Email:</strong> {user.email}
                </td>
                <td style={{ border: "none", padding: "4px 0" }}>
                  <strong>4. Đơn vị công tác:</strong> {user.department?.name || "N/A"}
                </td>
              </tr>
              <tr style={{ border: "none" }}>
                <td colSpan={2} style={{ border: "none", padding: "4px 0" }}>
                  <strong>5. Chức vụ / Chức danh nghề nghiệp:</strong> {user.managementPosition?.name || "Giảng viên"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PHẦN II: KẾT QUẢ ĐÁNH GIÁ NHIỆM VỤ (OKR) */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ textTransform: "uppercase", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            II. KẾT QUẢ ĐÁNH GIÁ NHIỆM VỤ THEO OKR
          </h3>
          {form?.okrObjectiveName && (
            <div style={{ fontStyle: "italic", marginBottom: "8px" }}>
              * Quy chế đánh giá áp dụng mẫu: {form.okrObjectiveName}
            </div>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", width: "8%" }}>STT</th>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "left", width: "52%" }}>Tiêu chí / Nhiệm vụ</th>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", width: "12%" }}>Điểm Tối Đa</th>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", width: "14%" }}>Điểm Tự Khai</th>
                <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", width: "14%" }}>Điểm QL Duyệt</th>
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
                <td colSpan={2} style={{ border: "1px solid #000", padding: "8px", textAlign: "center", textTransform: "uppercase" }}>TỔNG ĐIỂM</td>
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
            III. TỰ NHẬN XẾP LOẠI CHẤT LƯỢNG
          </h3>
          <div style={{ marginBottom: "10px" }}>
            <strong>1. Tự nhận xét ưu/khuyết điểm:</strong>
            <p style={{ margin: "5px 0 15px 15px", whiteSpace: "pre-wrap", textAlign: "justify" }}>
              {selfComment || "Chưa có nhận xét tự khai."}
            </p>
          </div>
          <div>
            <strong>2. Tự xếp loại chất lượng:</strong>
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {selfRating === "EXCELLENT" && "Hoàn thành xuất sắc nhiệm vụ"}
              {selfRating === "GOOD" && "Hoàn thành tốt nhiệm vụ / Hoàn thành nhiệm vụ"}
              {selfRating === "POOR" && "Không hoàn thành nhiệm vụ"}
              {!selfRating && "Chưa xếp loại"}
            </span>
          </div>
        </div>

        {/* PHẦN IV: ĐÁNH GIÁ, XẾP LOẠI (QUẢN LÝ) */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ textTransform: "uppercase", fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            IV. KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI CỦA CẤP QUẢN LÝ
          </h3>
          <div style={{ marginBottom: "10px" }}>
            <strong>1. Nhận xét, đánh giá của cấp trên trực tiếp:</strong>
            <p style={{ margin: "5px 0 15px 15px", whiteSpace: "pre-wrap", textAlign: "justify" }}>
              {form?.managerComment || "Không có nhận xét từ Quản lý."}
            </p>
          </div>
          <div>
            <strong>2. Kết quả xếp loại chất lượng viên chức:</strong>
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {form?.managerRating === "EXCELLENT" && "Hoàn thành xuất sắc nhiệm vụ"}
              {form?.managerRating === "GOOD" && "Hoàn thành tốt nhiệm vụ / Hoàn thành nhiệm vụ"}
              {form?.managerRating === "POOR" && "Không hoàn thành nhiệm vụ"}
              {!form?.managerRating && "Chưa có kết quả duyệt từ quản lý"}
            </span>
          </div>
        </div>

        {/* KÝ TÊN */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "none", marginTop: "30px" }}>
          <tbody>
            <tr style={{ border: "none" }}>
              <td style={{ width: "50%", textAlign: "center", border: "none", padding: 0, verticalAlign: "top" }}>
                <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>VIÊN CHỨC TỰ ĐÁNH GIÁ</span>
                <br />
                <em style={{ fontSize: "12px" }}>(Ký và ghi rõ họ tên)</em>
                <br />
                <br />
                <br />
                <br />
                <span style={{ fontWeight: "bold" }}>{user.name}</span>
              </td>
              <td style={{ width: "50%", textAlign: "center", border: "none", padding: 0, verticalAlign: "top" }}>
                <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>CẤP TRÊN TRỰC TIẾP ĐÁNH GIÁ</span>
                <br />
                <em style={{ fontSize: "12px" }}>(Ký và ghi rõ họ tên)</em>
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
