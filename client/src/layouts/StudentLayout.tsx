import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  HomeOutlined,
  PlusCircleOutlined,
  DollarOutlined,
  ShopOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/stu/home', icon: <HomeOutlined />, label: '主基地' },
  { key: '/stu/apply', icon: <PlusCircleOutlined />, label: '提交任务' },
  { key: '/stu/points', icon: <DollarOutlined />, label: '积分记录' },
  { key: '/stu/exchange', icon: <ShopOutlined />, label: '兑换商店' },
  { key: '/stu/profile', icon: <UserOutlined />, label: '个人信息' },
];

const siderStyle: React.CSSProperties = {
  background: 'rgba(8, 8, 28, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(0,212,255,0.12)',
};

const headerStyle: React.CSSProperties = {
  background: 'rgba(10, 10, 30, 0.9)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(0,212,255,0.12)',
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
  border: '1px solid rgba(0,212,255,0.1)',
  minHeight: 280,
};

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          borderBottom: '1px solid rgba(0,212,255,0.12)',
          gap: 8,
        }}>
          <ThunderboltOutlined style={{ color: '#00d4ff', fontSize: 20 }} />
          {!collapsed && (
            <span style={{
              fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 2,
              background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              积分系统
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
            icon={collapsed ? <MenuUnfoldOutlined style={{ color: '#00d4ff' }} /> : <MenuFoldOutlined style={{ color: '#00d4ff' }} />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              background: 'rgba(0,212,255,0.08)',
              borderRadius: 20,
              border: '1px solid rgba(0,212,255,0.15)',
            }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
              }} />
              <Text style={{ color: '#e0e0f0', fontSize: 13 }}>
                {(user as any)?.name}
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
