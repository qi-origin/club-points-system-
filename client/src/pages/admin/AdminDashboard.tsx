import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Spin } from 'antd';
import {
  TeamOutlined, DollarOutlined, AuditOutlined, GiftOutlined, ShoppingCartOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../api/endpoints';

const { Title } = Typography;

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const logColumns = [
    { title: '操作人', dataIndex: ['admin', 'username'], width: 100 },
    { title: '操作', dataIndex: 'action', width: 120 },
    { title: '对象类型', dataIndex: 'targetType', width: 100 },
    { title: '时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <Title level={4}>数据看板</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card><Statistic title="学生总数" value={data?.studentCount ?? 0} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card><Statistic title="累计发放" value={data?.totalPointsEarned ?? 0} prefix={<DollarOutlined />} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card><Statistic title="累计消耗" value={data?.totalPointsSpent ?? 0} prefix={<DollarOutlined />} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card><Statistic title="待审核申请" value={data?.pendingApplications ?? 0} prefix={<AuditOutlined />} valueStyle={{ color: data?.pendingApplications > 0 ? '#faad14' : undefined }} /></Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card><Statistic title="待处理订单" value={data?.pendingOrders ?? 0} prefix={<ShoppingCartOutlined />} valueStyle={{ color: data?.pendingOrders > 0 ? '#faad14' : undefined }} /></Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card><Statistic title="上架资源" value={data?.totalResources ?? 0} prefix={<GiftOutlined />} /></Card>
        </Col>
      </Row>

      <Title level={5}>最近操作日志</Title>
      <Table
        rowKey="id"
        columns={logColumns}
        dataSource={data?.recentLogs || []}
        pagination={false}
        size="small"
      />
    </div>
  );
}
