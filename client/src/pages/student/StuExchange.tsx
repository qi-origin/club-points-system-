import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Card, Typography, Tag, Spin, Empty } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { studentApi } from '../../api/endpoints';

const { Title, Text } = Typography;

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
      <Title level={4}>兑换中心</Title>
      {resources.length === 0 ? (
        <Empty description="暂无可兑换资源" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
          dataSource={resources}
          renderItem={(item: any) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => navigate(`/stu/exchange/${item.id}`)}
                cover={
                  item.imageUrl ? (
                    <img alt={item.name} src={item.imageUrl} style={{ height: 160, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                      <GiftOutlined style={{ fontSize: 48, color: '#ccc' }} />
                    </div>
                  )
                }
              >
                <Card.Meta
                  title={item.name}
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="blue">{item.pointsRequired} 积分</Tag>
                        <Tag>库存 {item.stock}</Tag>
                      </div>
                      <Text type="secondary" ellipsis>{item.description || '暂无描述'}</Text>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
