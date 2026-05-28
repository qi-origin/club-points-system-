import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, theme } from 'antd';
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
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '数据看板' },
  { key: '/admin/students', icon: <TeamOutlined />, label: '学生管理' },
  { key: '/admin/review', icon: <AuditOutlined />, label: '积分审核' },
  { key: '/admin/point-records', icon: <DollarOutlined />, label: '积分流水' },
  { key: '/admin/resources', icon: <GiftOutlined />, label: '资源管理' },
  { key: '/admin/exchange-orders', icon: <ShoppingCartOutlined />, label: '兑换订单' },
  { key: '/admin/operation-logs', icon: <FileTextOutlined />, label: '操作日志' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: '系统设置' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token: themeToken } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        style={{ background: themeToken.colorBgContainer }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${themeToken.colorBorderSecondary}` }}>
          <Text strong style={{ fontSize: collapsed ? 14 : 16, whiteSpace: 'nowrap' }}>
            {collapsed ? '管理' : '社团管理系统'}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: themeToken.colorBgContainer, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${themeToken.colorBorderSecondary}` }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Text>{(user as any)?.username}</Text>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
              退出
            </Button>
          </div>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: themeToken.colorBgContainer, borderRadius: themeToken.borderRadiusLG, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
