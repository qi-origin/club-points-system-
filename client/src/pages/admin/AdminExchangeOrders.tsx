import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Modal, Input, message, Typography, Select } from 'antd';
import { adminApi } from '../../api/endpoints';

const { Title } = Typography;

export default function AdminExchangeOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [cancelModal, setCancelModal] = useState<{ open: boolean; order: any } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchData = () => {
    setLoading(true);
    adminApi.getExchangeOrders({ page, pageSize: 10, status: statusFilter })
      .then((res) => {
        setOrders(res.data.list);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleComplete = async (order: any) => {
    Modal.confirm({
      title: '确认完成',
      content: `确认完成「${order.resource?.name}」的兑换吗？`,
      onOk: async () => {
        try {
          await adminApi.processExchangeOrder(order.id, { action: 'complete' });
          message.success('已标记完成');
          fetchData();
        } catch (err: any) {
          message.error(err.response?.data?.error || '操作失败');
        }
      },
    });
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      await adminApi.processExchangeOrder(cancelModal.order.id, { action: 'cancel', cancelReason });
      message.success('已取消，积分已退回');
      setCancelModal(null);
      setCancelReason('');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    }
  };

  const statusMap: Record<number, { color: string; text: string }> = {
    0: { color: 'processing', text: '待处理' },
    1: { color: 'success', text: '已完成' },
    2: { color: 'default', text: '已取消' },
  };

  const columns = [
    { title: '学生', width: 80, render: (_: any, r: any) => r.student?.name || '-' },
    { title: '资源', width: 120, render: (_: any, r: any) => r.resource?.name || '-' },
    { title: '消耗积分', dataIndex: 'pointsCost', width: 100 },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (s: number) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    { title: '处理人', width: 80, render: (_: any, r: any) => r.handler?.username || '-' },
    { title: '取消原因', dataIndex: 'cancelReason', ellipsis: true, width: 150 },
    { title: '提交时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
    {
      title: '操作', width: 160,
      render: (_: any, record: any) => (
        record.status === 0 ? (
          <Space>
            <Button size="small" type="primary" onClick={() => handleComplete(record)}>完成</Button>
            <Button size="small" danger onClick={() => setCancelModal({ open: true, order: record })}>取消</Button>
          </Space>
        ) : null
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>兑换订单</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          placeholder="状态"
          allowClear
          options={[
            { value: 0, label: '待处理' },
            { value: 1, label: '已完成' },
            { value: 2, label: '已取消' },
          ]}
        />
        <Button onClick={() => { setPage(1); fetchData(); }}>刷新</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title="取消订单"
        open={cancelModal?.open ?? false}
        onOk={handleCancel}
        onCancel={() => setCancelModal(null)}
        okText="确认取消"
        okButtonProps={{ danger: true }}
      >
        <p>资源: {cancelModal?.order?.resource?.name}</p>
        <p>学生: {cancelModal?.order?.student?.name}</p>
        <p>消耗积分: {cancelModal?.order?.pointsCost}（取消后退回）</p>
        <Input.TextArea
          rows={2}
          placeholder="取消原因（必填）"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          style={{ marginTop: 8 }}
        />
      </Modal>
    </div>
  );
}
