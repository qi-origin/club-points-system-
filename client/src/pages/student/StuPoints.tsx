import { useEffect, useState } from 'react';
import { Card, Tabs, Table, Tag, Typography, Statistic, Row, Col } from 'antd';
import { studentApi } from '../../api/endpoints';

const { Title } = Typography;

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
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (s: number) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    { title: '审核意见', dataIndex: 'reviewComment', ellipsis: true, width: 150 },
    { title: '提交时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  const recColumns = [
    {
      title: '类型', dataIndex: 'type', width: 80,
      render: (t: string) => <Tag color={typeMap[t]?.color}>{typeMap[t]?.text}</Tag>,
    },
    { title: '金额', dataIndex: 'amount', width: 80 },
    { title: '余额', dataIndex: 'balanceAfter', width: 80 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <Title level={4}>我的积分</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}><Card><Statistic title="当前积分" value={overview?.currentPoints ?? 0} valueStyle={{ color: '#3f8600' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="累计获得" value={overview?.totalEarned ?? 0} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="累计消耗" value={overview?.totalSpent ?? 0} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="待审核" value={overview?.pendingPoints ?? 0} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs items={[
          {
            key: 'applications',
            label: `积分申请 (${appTotal})`,
            children: (
              <Table
                rowKey="id"
                columns={appColumns}
                dataSource={applications}
                loading={loading}
                pagination={false}
                size="small"
              />
            ),
          },
          {
            key: 'records',
            label: `积分流水 (${recTotal})`,
            children: (
              <Table
                rowKey="id"
                columns={recColumns}
                dataSource={records}
                loading={loading}
                pagination={false}
                size="small"
              />
            ),
          },
        ]} />
      </Card>
    </div>
  );
}
