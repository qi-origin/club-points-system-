import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  AuditOutlined,
  DollarOutlined,
  GiftOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '数据看板' },
  { key: '/admin/students', icon: <TeamOutlined />, label: '学生管理' },
  { key: '/admin/review', icon: <AuditOutlined />, label: '任务审核' },
  { key: '/admin/point-records', icon: <DollarOutlined />, label: '积分流水' },
  { key: '/admin/resources', icon: <GiftOutlined />, label: '资源管理' },
  { key: '/admin/exchange-orders', icon: <ShoppingCartOutlined />, label: '兑换订单' },
  { key: '/admin/operation-logs', icon: <FileTextOutlined />, label: '操作日志' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const siderStyle: React.CSSProperties = {
  background: 'rgba(8, 8, 28, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(168, 85, 247, 0.12)',
};

const headerStyle: React.CSSProperties = {
  background: 'rgba(10, 10, 30, 0.9)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(168, 85, 247, 0.12)',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const contentStyle: React.CSSProperties = {
  margin: 24,
  padding: 24,
  background: 'rgba(15, 15, 40, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 12,
  border: '1px solid rgba(168, 85, 247, 0.1)',
  minHeight: 280,
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        width={220}
        style={siderStyle}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(168, 85, 247, 0.12)',
          gap: 8,
        }}>
          <CrownOutlined style={{ color: '#a855f7', fontSize: 20 }} />
          {!collapsed && (
            <span style={{
              fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 2,
              background: 'linear-gradient(135deg, #a855f7, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              管理系统
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderInlineEnd: 'none',
            marginTop: 8,
          }}
          theme="dark"
        />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Header style={headerStyle}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined style={{ color: '#a855f7' }} /> : <MenuFoldOutlined style={{ color: '#a855f7' }} />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              background: 'rgba(168,85,247,0.08)',
              borderRadius: 20,
              border: '1px solid rgba(168,85,247,0.15)',
            }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 6px #f59e0b',
              }} />
              <Text style={{ color: '#e0e0f0', fontSize: 13 }}>
                {(user as any)?.username}
              </Text>
            </div>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: '#8888aa' }}
            >
              退出
            </Button>
          </div>
        </Header>
        <Content style={contentStyle}>
          <div className="game-page">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
