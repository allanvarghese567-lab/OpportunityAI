import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "./lib/api";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NewProjectPage from "./pages/NewProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ResearchWorkspacePage from "./pages/ResearchWorkspacePage";
import OpportunityExplorerPage from "./pages/OpportunityExplorerPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import ApprovalPage from "./pages/ApprovalPage";
import ExecutionPage from "./pages/ExecutionPage";
import ReportPage from "./pages/ReportPage";
import Layout from "./components/Layout";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    authApi.me().then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-400">Loading…</div></div>;
  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <Layout user={user} onLogout={() => { localStorage.removeItem("token"); setUser(null); }}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/research" element={<ResearchWorkspacePage />} />
        <Route path="/projects/:id/opportunities" element={<OpportunityExplorerPage />} />
        <Route path="/projects/:id/opportunities/:oppId" element={<OpportunityDetailPage />} />
        <Route path="/projects/:id/approval" element={<ApprovalPage />} />
        <Route path="/projects/:id/execution" element={<ExecutionPage />} />
        <Route path="/projects/:id/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
