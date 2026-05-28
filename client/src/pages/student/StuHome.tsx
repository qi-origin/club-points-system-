import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { PlusCircleOutlined, ShopOutlined, DollarOutlined } from '@ant-design/icons';
import { studentApi } from '../../api/endpoints';

const { Title } = Typography;

export default function StuHome() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    studentApi.getPointsOverview()
      .then((res) => setOverview(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <Title level={4}>积分概览</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="当前可用积分" value={overview?.currentPoints ?? 0} prefix={<DollarOutlined />} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="累计获得积分" value={overview?.totalEarned ?? 0} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="累计消耗积分" value={overview?.totalSpent ?? 0} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      {overview?.pendingPoints > 0 && (
        <Card style={{ marginBottom: 24, background: '#fffbe6', border: '1px solid #ffe58f' }}>
          <span>你有 <strong>{overview.pendingPoints}</strong> 积分正在审核中</span>
        </Card>
      )}

      <Title level={4}>快捷操作</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card hoverable onClick={() => navigate('/stu/apply')}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <PlusCircleOutlined style={{ fontSize: 48, color: '#1677ff' }} />
              <div style={{ marginTop: 12, fontSize: 16 }}>提交积分申请</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card hoverable onClick={() => navigate('/stu/exchange')}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <ShopOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              <div style={{ marginTop: 12, fontSize: 16 }}>兑换中心</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
