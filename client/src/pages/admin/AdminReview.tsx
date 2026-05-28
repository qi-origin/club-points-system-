import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Modal, Input, message, Typography, Select } from 'antd';
import { adminApi } from '../../api/endpoints';

const { Title } = Typography;
const { TextArea } = Input;

export default function AdminReview() {
  const [applications, setApplications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(0);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; app: any; action: 'approve' | 'reject' } | null>(null);
  const [comment, setComment] = useState('');

  const fetchData = () => {
    setLoading(true);
    adminApi.getApplications({ page, pageSize: 10, status: statusFilter })
      .then((res) => {
        setApplications(res.data.list);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleReview = async () => {
    if (!reviewModal) return;
    try {
      await adminApi.reviewApplication(reviewModal.app.id, {
        action: reviewModal.action,
        comment: comment || undefined,
      });
      message.success(reviewModal.action === 'approve' ? '审核通过' : '已驳回');
      setReviewModal(null);
      setComment('');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    }
  };

  const statusMap: Record<number, { color: string; text: string }> = {
    0: { color: 'processing', text: '待审核' },
    1: { color: 'success', text: '已通过' },
    2: { color: 'error', text: '已驳回' },
  };

  const columns = [
    { title: '学生', width: 100, render: (_: any, r: any) => r.student?.name || '-' },
    { title: '学号', width: 100, render: (_: any, r: any) => r.student?.studentNo || '-' },
    { title: '任务描述', dataIndex: 'taskDescription', ellipsis: true },
    { title: '申请积分', dataIndex: 'pointsApplied', width: 100 },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (s: number) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    { title: '审核人', width: 80, render: (_: any, r: any) => r.reviewer?.username || '-' },
    { title: '审核意见', dataIndex: 'reviewComment', ellipsis: true, width: 150 },
    { title: '提交时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
    {
      title: '操作', width: 180,
      render: (_: any, record: any) => (
        record.status === 0 ? (
          <Space>
            <Button size="small" type="primary" onClick={() => setReviewModal({ open: true, app: record, action: 'approve' })}>
              通过
            </Button>
            <Button size="small" danger onClick={() => setReviewModal({ open: true, app: record, action: 'reject' })}>
              驳回
            </Button>
          </Space>
        ) : null
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>积分审核</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          options={[
            { value: undefined, label: '全部' },
            { value: 0, label: '待审核' },
            { value: 1, label: '已通过' },
            { value: 2, label: '已驳回' },
          ]}
        />
        <Button onClick={() => { setPage(1); fetchData(); }}>刷新</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={applications}
        loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={reviewModal?.action === 'approve' ? '确认通过' : '确认驳回'}
        open={reviewModal?.open ?? false}
        onOk={handleReview}
        onCancel={() => setReviewModal(null)}
        okText="确认"
        cancelText="取消"
      >
        <p>学生: {reviewModal?.app?.student?.name} ({reviewModal?.app?.student?.studentNo})</p>
        <p>任务: {reviewModal?.app?.taskDescription}</p>
        <p>申请积分: {reviewModal?.app?.pointsApplied}</p>
        <TextArea
          rows={3}
          placeholder="审核意见（可选）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ marginTop: 8 }}
        />
      </Modal>
    </div>
  );
}
