import { useEffect, useState } from 'react';
import { Tabs, Table, Tag, Row, Col } from 'antd';
import { studentApi } from '../../api/endpoints';

export default function StuPoints() {
  const [overview, setOverview] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [appTotal, setAppTotal] = useState(0);
  const [recTotal, setRecTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentApi.getPointsOverview(),
      studentApi.getMyApplications({ pageSize: 50 }),
      studentApi.getMyPointRecords({ pageSize: 50 }),
    ]).then(([overviewRes, appRes, recRes]) => {
      setOverview(overviewRes.data);
      setApplications(appRes.data.list);
      setAppTotal(appRes.data.total);
      setRecords(recRes.data.list);
      setRecTotal(recRes.data.total);
    }).finally(() => setLoading(false));
  }, []);

  const statusMap: Record<number, { color: string; text: string }> = {
    0: { color: 'processing', text: '待审核' },
    1: { color: 'success', text: '已通过' },
    2: { color: 'error', text: '已驳回' },
  };

  const typeMap: Record<string, { color: string; text: string }> = {
    earn: { color: 'green', text: '获得' },
    spend: { color: 'red', text: '消耗' },
    refund: { color: 'blue', text: '退回' },
  };

  const appColumns = [
    { title: '任务描述', dataIndex: 'taskDescription', ellipsis: true },
    { title: '申请积分', dataIndex: 'pointsApplied', width: 100 },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: number) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '审核意见', dataIndex: 'reviewComment', ellipsis: true, width: 150 },
    { title: '提交时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  const recColumns = [
    { title: '类型', dataIndex: 'type', width: 80, render: (t: string) => <Tag color={typeMap[t]?.color}>{typeMap[t]?.text}</Tag> },
    { title: '金额', dataIndex: 'amount', width: 80 },
    { title: '余额', dataIndex: 'balanceAfter', width: 80 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  const current = overview?.currentPoints ?? 0;
  const stats = [
    { label: '当前积分', value: current, className: 'game-stat-green' },
    { label: '累计获得', value: overview?.totalEarned ?? 0, className: '' },
    { label: '累计消耗', value: overview?.totalSpent ?? 0, className: 'game-stat-red' },
    { label: '待审核', value: overview?.pendingPoints ?? 0, className: 'game-stat-gold' },
  ];

  return (
    <div>
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>我的积分</div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <Col xs={12} sm={6} key={s.label}>
            <div className="game-card" style={{ padding: '18px 12px', textAlign: 'center' }}>
              <div style={{ color: '#8888aa', fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>{s.label}</div>
              <div className={s.className} style={{ fontSize: 26 }}>{s.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      <div className="game-card" style={{ padding: 16 }}>
        <Tabs
          items={[
            { key: 'applications', label: `积分申请 (${appTotal})`, children: <Table rowKey="id" columns={appColumns} dataSource={applications} loading={loading} pagination={false} size="small" /> },
            { key: 'records', label: `积分流水 (${recTotal})`, children: <Table rowKey="id" columns={recColumns} dataSource={records} loading={loading} pagination={false} size="small" /> },
          ]}
        />
      </div>
    </div>
  );
}
