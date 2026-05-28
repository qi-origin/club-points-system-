import { Descriptions } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { SettingOutlined } from '@ant-design/icons';

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>
        <SettingOutlined style={{ marginRight: 8 }} />系统设置
      </div>

      <div className="game-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid rgba(168,85,247,0.12)',
          fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
          fontSize: 14, fontWeight: 600, color: '#a855f7',
        }}>
          管理员信息
        </div>
        <div style={{ padding: 24 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="用户名">{(user as any)?.username}</Descriptions.Item>
            <Descriptions.Item label="角色">
              {(user as any)?.role === 'super_admin' ? '超级管理员' : '管理员'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid rgba(0,212,255,0.12)',
          fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
          fontSize: 14, fontWeight: 600, color: '#00d4ff',
        }}>
          关于系统
        </div>
        <div style={{ padding: 24, color: '#8888aa', lineHeight: 2 }}>
          <p>社团积分记录与资源兑换系统 v1.0</p>
          <p>用于社团内部积分管理和资源兑换</p>
          <p>如有问题，请联系系统管理员</p>
        </div>
      </div>
    </div>
  );
}
