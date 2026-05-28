import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Typography, message, Modal, Spin } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { studentApi } from '../../api/endpoints';

const { Title } = Typography;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function StuExchangeDetail() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      Promise.all([
        studentApi.getResourceDetail(Number(id)),
        studentApi.getPointsOverview(),
      ]).then(([res, ovRes]) => {
        setResource(res.data);
        setOverview(ovRes.data);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleExchange = () => {
    Modal.confirm({
      title: '确认兑换',
      content: `确定使用 ${resource.pointsRequired} 积分兑换「${resource.name}」吗？`,
      okText: '确认兑换',
      cancelText: '取消',
      onOk: async () => {
        setSubmitting(true);
        try {
          await studentApi.createExchangeOrder({
            resourceId: resource.id,
            idempotencyKey: generateId(),
          });
          message.success('兑换成功！请等待管理员处理');
          navigate('/stu/exchange/orders');
        } catch (err: any) {
          message.error(err.response?.data?.error || '兑换失败');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const canExchange = overview?.currentPoints >= resource?.pointsRequired && resource?.stock > 0;

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={4}>资源详情</Title>
      <Card>
        {resource?.imageUrl ? (
          <img alt={resource.name} src={resource.imageUrl} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
        ) : (
          <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: 8, marginBottom: 16 }}>
            <GiftOutlined style={{ fontSize: 64, color: '#ccc' }} />
          </div>
        )}

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="资源名称">{resource?.name}</Descriptions.Item>
          <Descriptions.Item label="描述">{resource?.description || '暂无描述'}</Descriptions.Item>
          <Descriptions.Item label="所需积分">
            <Tag color="blue" style={{ fontSize: 16 }}>{resource?.pointsRequired} 积分</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="当前库存">
            <Tag color={resource?.stock > 0 ? 'green' : 'red'}>{resource?.stock > 0 ? `${resource.stock} 件` : '已售罄'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="我的积分">
            {overview?.currentPoints ?? 0} 积分
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {!canExchange && (
            <div style={{ marginBottom: 12, color: '#ff4d4f' }}>
              {overview?.currentPoints < resource?.pointsRequired ? '积分不足' : '库存不足'}
            </div>
          )}
          <Button
            type="primary"
            size="large"
            disabled={!canExchange}
            loading={submitting}
            onClick={handleExchange}
          >
            立即兑换
          </Button>
        </div>
      </Card>
    </div>
  );
}
