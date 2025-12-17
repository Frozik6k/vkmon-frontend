import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import AccountsPage from './pages/AccountsPage';
import AutoPostingPage from './pages/AutoPostingPage';
import AiPage from './pages/AiPage';
import LogsPage from './pages/LogsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/auto-posting" element={<AutoPostingPage />} />
        <Route path="/ai" element={<AiPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
