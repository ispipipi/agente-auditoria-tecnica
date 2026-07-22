import { Navigate, Route, Routes } from "react-router-dom";
import { CaseInboxPage } from "./pages/CaseInboxPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DecisionPage } from "./pages/DecisionPage";
import { ExtractionPage } from "./pages/ExtractionPage";
import { FinancialPage } from "./pages/FinancialPage";
import { ResultPage } from "./pages/ResultPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/casos" element={<CaseInboxPage />} />
      <Route path="/caso/:id/extraccion" element={<ExtractionPage />} />
      <Route path="/caso/:id/decision" element={<DecisionPage />} />
      <Route path="/caso/:id/financiero" element={<FinancialPage />} />
      <Route path="/caso/:id/resultado" element={<ResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
