import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, NumberOutlined, LockOutlined, ThunderboltOutlined, CrownOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = async (values: { name: string; studentNo: string }) => {
    setLoading(true);
    try {
      await login('student', values);
      message.success('登录成功');
      navigate('/stu/home');
    } catch (err: any) {
      message.error(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login('admin', values);
      message.success('登录成功');
      navigate('/admin/dashboard');
    } catch (err: any) {
      message.error(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'student',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ThunderboltOutlined /> 学生登录
        </span>
      ),
    },
    {
      key: 'admin',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CrownOutlined /> 管理员登录
        </span>
      ),
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Logo / Title */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontSize: 48,
          marginBottom: 16,
          filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.5))',
        }}>
          <ThunderboltOutlined style={{ color: '#00d4ff' }} />
        </div>
        <div style={{
          fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 4,
          background: 'linear-gradient(135deg, #00d4ff, #a855f7, #00d4ff)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer 3s linear infinite',
          marginBottom: 8,
        }}>
          CLUB POINTS SYSTEM
        </div>
        <div style={{
          color: '#8888aa',
          fontSize: 14,
          letterSpacing: 2,
          fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
        }}>
          社团积分记录与资源兑换系统
        </div>
      </div>

      {/* Login Card */}
      <div style={{
        width: 420,
        maxWidth: '100%',
        background: 'rgba(15, 15, 40, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        border: '1px solid rgba(0, 212, 255, 0.25)',
        boxShadow: '0 0 60px rgba(0, 212, 255, 0.08), 0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '32px 32px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: 40, right: 40,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
        }} />

        <Tabs
          activeKey={role}
          onChange={(key) => setRole(key as 'student' | 'admin')}
          centered
          items={tabItems}
          style={{ marginBottom: 8 }}
          tabBarStyle={{
            borderBottomColor: 'rgba(0,212,255,0.15)',
          }}
        />

        {role === 'student' ? (
          <Form onFinish={handleStudentLogin} size="large" autoComplete="off">
            <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#00d4ff' }} />}
                placeholder="输入你的姓名"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(0,212,255,0.2)',
                  color: '#e0e0f0',
                  height: 48,
                  borderRadius: 8,
                }}
              />
            </Form.Item>
            <Form.Item name="studentNo" rules={[{ required: true, message: '请输入学号' }]}>
              <Input
                prefix={<NumberOutlined style={{ color: '#a855f7' }} />}
                placeholder="输入你的学号"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(168,85,247,0.25)',
                  color: '#e0e0f0',
                  height: 48,
                  borderRadius: 8,
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 48,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 4,
                  fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
                  background: 'linear-gradient(135deg, #00d4ff, #0891b2)',
                  border: 'none',
                  boxShadow: '0 0 30px rgba(0, 212, 255, 0.25)',
                }}
              >
                进 入 系 统
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form onFinish={handleAdminLogin} size="large" autoComplete="off">
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input
                prefix={<CrownOutlined style={{ color: '#f59e0b' }} />}
                placeholder="管理员用户名"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(245,158,11,0.25)',
                  color: '#e0e0f0',
                  height: 48,
                  borderRadius: 8,
                }}
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#a855f7' }} />}
                placeholder="管理员密码"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(168,85,247,0.25)',
                  color: '#e0e0f0',
                  height: 48,
                  borderRadius: 8,
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 48,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 4,
                  fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  border: 'none',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.25)',
                }}
              >
                进 入 后 台
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Test account hint */}
        <div style={{
          textAlign: 'center',
          color: '#666688',
          fontSize: 11,
          marginTop: 16,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 6,
        }}>
          测试账号 ｜ 学生：张三 / 2024001 ｜ 管理员：admin / admin123
        </div>
      </div>

      {/* Add shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
