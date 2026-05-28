import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/login/LoginPage';
import StuHome from './pages/student/StuHome';
import StuApply from './pages/student/StuApply';
import StuPoints from './pages/student/StuPoints';
import StuExchange from './pages/student/StuExchange';
import StuExchangeDetail from './pages/student/StuExchangeDetail';
import StuExchangeOrders from './pages/student/StuExchangeOrders';
import StuProfile from './pages/student/StuProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminReview from './pages/admin/AdminReview';
import AdminPointRecords from './pages/admin/AdminPointRecords';
import AdminResources from './pages/admin/AdminResources';
import AdminExchangeOrders from './pages/admin/AdminExchangeOrders';
import AdminOperationLogs from './pages/admin/AdminOperationLogs';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: 'student' | 'admin' }) {
  const { isAuthenticated, role: userRole } = useAuth();
  if (!isAuthenticated) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
  if (userRole !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Student routes */}
      <Route path="/stu" element={
        <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/stu/home" replace />} />
        <Route path="home" element={<StuHome />} />
        <Route path="apply" element={<StuApply />} />
        <Route path="points" element={<StuPoints />} />
        <Route path="exchange" element={<StuExchange />} />
        <Route path="exchange/:id" element={<StuExchangeDetail />} />
        <Route path="exchange/orders" element={<StuExchangeOrders />} />
        <Route path="profile" element={<StuProfile />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="review" element={<AdminReview />} />
        <Route path="point-records" element={<AdminPointRecords />} />
        <Route path="resources" element={<AdminResources />} />
        <Route path="exchange-orders" element={<AdminExchangeOrders />} />
        <Route path="operation-logs" element={<AdminOperationLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
