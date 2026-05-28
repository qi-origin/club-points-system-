import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Tag, Spin, Empty } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { studentApi } from '../../api/endpoints';

export default function StuExchange() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    studentApi.getResources({ pageSize: 50 })
      .then((res) => setResources(res.data.list))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>
        <GiftOutlined style={{ marginRight: 8 }} />
        兑换商店
      </div>

      {resources.length === 0 ? (
        <div className="game-card" style={{ padding: 40, textAlign: 'center' }}>
          <Empty description={<span style={{ color: '#666' }}>暂无可兑换资源</span>} />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
          dataSource={resources}
          renderItem={(item: any) => (
            <List.Item>
              <div
                className="game-card"
                onClick={() => navigate(`/stu/exchange/${item.id}`)}
                style={{ cursor: 'pointer', overflow: 'hidden' }}
              >
                {item.imageUrl ? (
                  <img alt={item.name} src={item.imageUrl} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,212,255,0.04)',
                  }}>
                    <GiftOutlined style={{ fontSize: 48, color: 'rgba(0,212,255,0.2)' }} />
                  </div>
                )}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, color: '#e0e0f0', marginBottom: 8, fontSize: 15 }}>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <Tag color="blue" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      {item.pointsRequired} 积分
                    </Tag>
                    <Tag style={{ background: 'rgba(0,0,0,0.3)', color: '#888' }}>
                      库存 {item.stock}
                    </Tag>
                  </div>
                  <div style={{ color: '#666688', fontSize: 12 }}>
                    {item.description || '暂无描述'}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
