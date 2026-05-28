import { useEffect, useState } from 'react';
import { Table, Select, Space, Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/endpoints';

const actionLabels: Record<string, string> = {
  approve: '审核通过', reject: '审核驳回', manual_add: '手动加分', manual_deduct: '手动扣分',
  create_resource: '创建资源', update_resource: '更新资源', handle_order: '完成订单',
  cancel_order: '取消订单', create_student: '创建学生', toggle_student: '启用/禁用学生',
};

export default function AdminOperationLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);

  const fetchData = () => {
    setLoading(true);
    adminApi.getOperationLogs({ page, pageSize: 20, action: actionFilter })
      .then((res) => { setLogs(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, actionFilter]);

  const columns = [
    { title: '操作人', width: 80, render: (_: any, r: any) => r.admin?.username || '-' },
    { title: '操作类型', dataIndex: 'action', width: 120, render: (a: string) => actionLabels[a] || a },
    { title: '对象类型', dataIndex: 'targetType', width: 100 },
    { title: '对象ID', dataIndex: 'targetId', width: 80 },
    { title: '详情', dataIndex: 'detail', ellipsis: true, width: 200 },
    { title: 'IP', dataIndex: 'ip', width: 120 },
    { title: '时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>
        <FileTextOutlined style={{ marginRight: 8 }} />操作日志
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Select value={actionFilter} onChange={setActionFilter} style={{ width: 150 }} allowClear placeholder="操作类型"
          options={Object.entries(actionLabels).map(([value, label]) => ({ value, label }))} />
        <Button onClick={() => { setPage(1); fetchData(); }}
          style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' }}>
          刷新
        </Button>
      </Space>
      <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table rowKey="id" columns={columns} dataSource={logs} loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }} scroll={{ x: 1000 }} />
      </div>
    </div>
  );
}
