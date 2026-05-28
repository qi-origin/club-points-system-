import { Card, Typography, Descriptions } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={4}>系统设置</Title>
      <Card title="管理员信息">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="用户名">{(user as any)?.username}</Descriptions.Item>
          <Descriptions.Item label="角色">{(user as any)?.role === 'super_admin' ? '超级管理员' : '管理员'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="关于" style={{ marginTop: 16 }}>
        <p>社团积分记录与资源兑换系统 v1.0</p>
        <p>本系统用于社团内部积分管理和资源兑换，请在管理员指导下使用。</p>
        <p>如有问题，请联系系统管理员。</p>
      </Card>
    </div>
  );
}
