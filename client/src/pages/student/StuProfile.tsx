import { useEffect, useState } from 'react';
import { Card, Descriptions, Typography, Spin } from 'antd';
import { studentApi } from '../../api/endpoints';

const { Title } = Typography;

export default function StuProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getProfile()
      .then((res) => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const statusMap: Record<number, string> = { 1: '正常', 0: '已禁用' };

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={4}>个人中心</Title>
      <Card>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="姓名">{profile?.name}</Descriptions.Item>
          <Descriptions.Item label="学号">{profile?.studentNo}</Descriptions.Item>
          <Descriptions.Item label="账号状态">
            <span style={{ color: profile?.status === 1 ? '#52c41a' : '#ff4d4f' }}>
              {statusMap[profile?.status] || '未知'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="累计获得积分">{profile?.totalEarned}</Descriptions.Item>
          <Descriptions.Item label="累计消耗积分">{profile?.totalSpent}</Descriptions.Item>
          <Descriptions.Item label="当前积分">{profile?.totalEarned - profile?.totalSpent}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{new Date(profile?.createdAt).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
