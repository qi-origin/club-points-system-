import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Select, Space, Button } from 'antd';
import { adminApi } from '../../api/endpoints';

const { Title } = Typography;

export default function AdminPointRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  const fetchData = () => {
    setLoading(true);
    adminApi.getPointRecords({ page, pageSize: 20, type: typeFilter })
      .then((res) => {
        setRecords(res.data.list);
        setTotal(res.data.total);
      })
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
    {
      title: '类型', dataIndex: 'type', width: 80,
      render: (t: string) => <Tag color={typeMap[t]?.color}>{typeMap[t]?.text}</Tag>,
    },
    { title: '金额', dataIndex: 'amount', width: 80 },
    { title: '变动后余额', dataIndex: 'balanceAfter', width: 110 },
    { title: '来源', dataIndex: 'sourceType', width: 100 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '操作人', dataIndex: 'operatorName', width: 80 },
    { title: '时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <Title level={4}>积分流水</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 120 }}
          allowClear
          placeholder="类型"
          options={[
            { value: 'earn', label: '获得' },
            { value: 'spend', label: '消耗' },
            { value: 'refund', label: '退回' },
          ]}
        />
        <Button onClick={() => { setPage(1); fetchData(); }}>刷新</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
}
