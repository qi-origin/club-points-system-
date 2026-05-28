import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Spin } from 'antd';
import { PlusCircleOutlined, ShopOutlined, ThunderboltOutlined, StarFilled } from '@ant-design/icons';
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

  const current = overview?.currentPoints ?? 0;
  const earned = overview?.totalEarned ?? 0;
  const spent = overview?.totalSpent ?? 0;
  const maxPoints = Math.max(earned, 100);
  const pct = Math.min((current / maxPoints) * 100, 100);

  return (
    <div>
      {/* Level / Points Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
        padding: '20px 24px',
        background: 'rgba(15,15,40,0.8)',
        borderRadius: 12,
        border: '1px solid rgba(0,212,255,0.15)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))',
          border: '2px solid rgba(0,212,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
          boxShadow: '0 0 20px rgba(0,212,255,0.2)',
        }}>
          <ThunderboltOutlined style={{ color: '#00d4ff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
              fontSize: 32,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {current}
            </span>
            <span style={{ color: '#8888aa', fontSize: 13, fontFamily: 'Orbitron, sans-serif' }}>PT</span>
          </div>
          <div className="game-bar game-bar-cyan">
            <div className="game-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <div className="game-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ color: '#8888aa', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>
              累计获得
            </div>
            <div className="game-stat-green" style={{ fontSize: 28 }}>+{earned}</div>
          </div>
        </Col>
        <Col xs={12} sm={8}>
          <div className="game-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ color: '#8888aa', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>
              累计消耗
            </div>
            <div className="game-stat-red" style={{ fontSize: 28 }}>-{spent}</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className={`game-card game-card-gold ${overview?.pendingPoints > 0 ? 'game-pulse' : ''}`}
            style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ color: '#8888aa', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>
              审核中
            </div>
            <div className="game-stat-gold" style={{ fontSize: 28 }}>
              {overview?.pendingPoints ?? 0}
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Title level={5} style={{ color: '#ccc', marginBottom: 12, letterSpacing: 1, fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif' }}>
        <StarFilled style={{ color: '#f59e0b', marginRight: 8 }} />
        快捷行动
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <div className="game-card" onClick={() => navigate('/stu/apply')}
            style={{ padding: 28, textAlign: 'center', cursor: 'pointer' }}>
            <PlusCircleOutlined style={{ fontSize: 40, color: '#00d4ff', filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.4))' }} />
            <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: '#e0e0f0' }}>提交任务申请</div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>完成社团任务，获取积分奖励</div>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="game-card game-card-gold" onClick={() => navigate('/stu/exchange')}
            style={{ padding: 28, textAlign: 'center', cursor: 'pointer' }}>
            <ShopOutlined style={{ fontSize: 40, color: '#f59e0b', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.4))' }} />
            <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: '#e0e0f0' }}>积分兑换商店</div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>使用积分兑换社团资源</div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
