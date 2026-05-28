import { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { studentApi } from '../../api/endpoints';

export default function StuExchangeOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getMyExchangeOrders({ pageSize: 50 })
      .then((res) => setOrders(res.data.list))
      .finally(() => setLoading(false));
  }, []);

  const statusMap: Record<number, { color: string; text: string }> = {
    0: { color: 'processing', text: '待处理' },
    1: { color: 'success', text: '已完成' },
    2: { color: 'default', text: '已取消' },
  };

  const columns = [
    { title: '资源名称', dataIndex: 'resourceName' },
    { title: '消耗积分', dataIndex: 'pointsCost', width: 100 },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: number) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '取消原因', dataIndex: 'cancelReason', ellipsis: true, width: 150 },
    { title: '提交时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>兑换记录</div>
      <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table rowKey="id" columns={columns} dataSource={orders} loading={loading} pagination={false} />
      </div>
    </div>
  );
}
