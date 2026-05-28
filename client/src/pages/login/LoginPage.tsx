import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Tabs, message } from 'antd';
import { UserOutlined, NumberOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 420, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          社团积分记录与资源兑换系统
        </Title>

        <Tabs
          activeKey={role}
          onChange={(key) => setRole(key as 'student' | 'admin')}
          centered
          items={[
            { key: 'student', label: '学生登录' },
            { key: 'admin', label: '管理员登录' },
          ]}
        />

        {role === 'student' ? (
          <Form onFinish={handleStudentLogin} size="large" autoComplete="off">
            <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input prefix={<UserOutlined />} placeholder="姓名" />
            </Form.Item>
            <Form.Item name="studentNo" rules={[{ required: true, message: '请输入学号' }]}>
              <Input prefix={<NumberOutlined />} placeholder="学号" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登 录
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form onFinish={handleAdminLogin} size="large" autoComplete="off">
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登 录
              </Button>
            </Form.Item>
          </Form>
        )}

        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          测试账号：学生 张三 / 2024001　管理员 admin / admin123
        </div>
      </Card>
    </div>
  );
}
