import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Button } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/endpoints';

export default function AdminPointRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  const fetchData = () => {
    setLoading(true);
    adminApi.getPointRecords({ page, pageSize: 20, type: typeFilter })
      .then((res) => { setRecords(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, typeFilter]);

  const typeMap: Record<string, { color: string; text: string }> = {
    earn: { color: 'green', text: '获得' },
    spend: { color: 'red', text: '消耗' },
    refund: { color: 'blue', text: '退回' },
  };

  const columns = [
    { title: '学生', dataIndex: 'studentName', width: 80 },
    { title: '学号', dataIndex: 'studentNo', width: 100 },
    { title: '类型', dataIndex: 'type', width: 80, render: (t: string) => <Tag color={typeMap[t]?.color}>{typeMap[t]?.text}</Tag> },
    { title: '金额', dataIndex: 'amount', width: 80 },
    { title: '变动后余额', dataIndex: 'balanceAfter', width: 110 },
    { title: '来源', dataIndex: 'sourceType', width: 100 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '操作人', dataIndex: 'operatorName', width: 80 },
    { title: '时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>
        <DollarOutlined style={{ marginRight: 8 }} />积分流水
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 120 }} allowClear placeholder="类型"
          options={[{ value: 'earn', label: '获得' }, { value: 'spend', label: '消耗' }, { value: 'refund', label: '退回' }]} />
        <Button onClick={() => { setPage(1); fetchData(); }}
          style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' }}>
          刷新
        </Button>
      </Space>
      <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table rowKey="id" columns={columns} dataSource={records} loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }} scroll={{ x: 1000 }} />
      </div>
    </div>
  );
}
