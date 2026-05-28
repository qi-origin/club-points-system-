import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Button, Tag, message, Modal, Spin } from 'antd';
import { GiftOutlined, SwapOutlined } from '@ant-design/icons';
import { studentApi } from '../../api/endpoints';

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
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>
        <GiftOutlined style={{ marginRight: 8 }} />
        资源详情
      </div>

      <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
        {resource?.imageUrl ? (
          <img alt={resource.name} src={resource.imageUrl}
            style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: 200, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'rgba(0,212,255,0.04)',
          }}>
            <GiftOutlined style={{ fontSize: 64, color: 'rgba(0,212,255,0.15)' }} />
          </div>
        )}

        <div style={{ padding: 24 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="资源名称">{resource?.name}</Descriptions.Item>
            <Descriptions.Item label="描述">{resource?.description || '暂无描述'}</Descriptions.Item>
            <Descriptions.Item label="所需积分">
              <Tag color="blue" style={{ fontSize: 16, padding: '2px 12px' }}>
                {resource?.pointsRequired} 积分
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="当前库存">
              <Tag color={resource?.stock > 0 ? 'green' : 'red'}>
                {resource?.stock > 0 ? `${resource.stock} 件` : '已售罄'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="我的积分">
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 600 }}>
                {overview?.currentPoints ?? 0}
              </span> 积分
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            {!canExchange && (
              <div style={{
                marginBottom: 12, color: '#ef4444', fontSize: 13,
                padding: '8px 16px', background: 'rgba(239,68,68,0.08)',
                borderRadius: 6, display: 'inline-block',
              }}>
                {overview?.currentPoints < resource?.pointsRequired ? '积分不足' : '库存不足'}
              </div>
            )}
            <Button
              type="primary"
              size="large"
              disabled={!canExchange}
              loading={submitting}
              onClick={handleExchange}
              icon={<SwapOutlined />}
              style={{
                height: 48, borderRadius: 8, fontSize: 16, fontWeight: 700,
                fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
                letterSpacing: 2, marginTop: 8,
                background: canExchange ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined,
                border: 'none',
                boxShadow: canExchange ? '0 0 25px rgba(245,158,11,0.3)' : undefined,
              }}
            >
              确认兑换
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
