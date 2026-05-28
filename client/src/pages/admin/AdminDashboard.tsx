import { useEffect, useState } from 'react';
import { Row, Col, Table, Spin } from 'antd';
import {
  TeamOutlined, DollarOutlined, AuditOutlined, GiftOutlined, ShoppingCartOutlined, CrownOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../api/endpoints';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const stats = [
    { title: '学生总数', value: data?.studentCount ?? 0, icon: <TeamOutlined />, color: '#00d4ff', cls: '' },
    { title: '累计发放', value: data?.totalPointsEarned ?? 0, icon: <DollarOutlined />, color: '#22c55e', cls: 'game-stat-green' },
    { title: '累计消耗', value: data?.totalPointsSpent ?? 0, icon: <DollarOutlined />, color: '#ef4444', cls: 'game-stat-red' },
    { title: '待审核', value: data?.pendingApplications ?? 0, icon: <AuditOutlined />, color: '#f59e0b', cls: 'game-stat-gold', pulse: data?.pendingApplications > 0 },
    { title: '待处理订单', value: data?.pendingOrders ?? 0, icon: <ShoppingCartOutlined />, color: '#f59e0b', cls: 'game-stat-gold', pulse: data?.pendingOrders > 0 },
    { title: '上架资源', value: data?.totalResources ?? 0, icon: <GiftOutlined />, color: '#a855f7', cls: 'game-stat' },
  ];

  const logColumns = [
    { title: '操作人', dataIndex: ['admin', 'username'], width: 100 },
    { title: '操作', dataIndex: 'action', width: 120 },
    { title: '对象类型', dataIndex: 'targetType', width: 100 },
    { title: '时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(245,158,11,0.2))',
          border: '2px solid rgba(168,85,247,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 15px rgba(168,85,247,0.2)',
        }}>
          <CrownOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
        </div>
        <span style={{
          fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
          fontSize: 20, fontWeight: 700, letterSpacing: 2,
          background: 'linear-gradient(135deg, #a855f7, #f59e0b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          数据看板
        </span>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <Col xs={12} sm={8} lg={4} key={s.title}>
            <div className={`game-card ${s.pulse ? 'game-pulse' : ''}`}
              style={{ padding: '18px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, color: s.color, marginBottom: 8, filter: `drop-shadow(0 0 6px ${s.color}44)` }}>
                {s.icon}
              </div>
              <div className={s.cls} style={{ fontSize: 26, lineHeight: 1.2 }}>
                {s.value}
              </div>
              <div style={{ color: '#8888aa', fontSize: 11, marginTop: 4, letterSpacing: 1 }}>
                {s.title}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div style={{
        fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
        fontSize: 14, fontWeight: 600, color: '#8888aa',
        marginBottom: 12, letterSpacing: 1,
      }}>
        最近操作日志
      </div>
      <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          rowKey="id"
          columns={logColumns}
          dataSource={data?.recentLogs || []}
          pagination={false}
          size="small"
          style={{ background: 'transparent' }}
        />
      </div>
    </div>
  );
}
