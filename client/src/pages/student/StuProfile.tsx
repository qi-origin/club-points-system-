import { useEffect, useState } from 'react';
import { Descriptions, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { studentApi } from '../../api/endpoints';

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
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>
        <UserOutlined style={{ marginRight: 8 }} />
        个人信息
      </div>

      <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', padding: '28px 0', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))',
            border: '2px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 0 20px rgba(0,212,255,0.15)',
          }}>
            <UserOutlined style={{ color: '#00d4ff' }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e0e0f0' }}>{profile?.name}</div>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 13, color: '#8888aa', marginTop: 4 }}>{profile?.studentNo}</div>
        </div>

        <div style={{ padding: 24 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="姓名">{profile?.name}</Descriptions.Item>
            <Descriptions.Item label="学号">{profile?.studentNo}</Descriptions.Item>
            <Descriptions.Item label="账号状态">
              <span style={{ color: profile?.status === 1 ? '#22c55e' : '#ef4444' }}>
                {statusMap[profile?.status] || '未知'}
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                  background: profile?.status === 1 ? '#22c55e' : '#ef4444',
                  marginLeft: 8, boxShadow: `0 0 6px ${profile?.status === 1 ? '#22c55e' : '#ef4444'}`,
                }} />
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="累计获得积分">{profile?.totalEarned}</Descriptions.Item>
            <Descriptions.Item label="累计消耗积分">{profile?.totalSpent}</Descriptions.Item>
            <Descriptions.Item label="当前积分">
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 600, color: '#22c55e' }}>
                {profile?.totalEarned - profile?.totalSpent}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">{new Date(profile?.createdAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </div>
  );
}
