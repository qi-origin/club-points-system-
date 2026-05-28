import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined, GiftOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/endpoints';

export default function AdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    adminApi.getResources({ page, pageSize: 10 })
      .then((res) => { setResources(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleCreate = () => { setEditingResource(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (record: any) => { setEditingResource(record); form.setFieldsValue(record); setModalOpen(true); };

  const handleSave = async (values: any) => {
    try {
      if (editingResource) { await adminApi.updateResource(editingResource.id, values); message.success('更新成功'); }
      else { await adminApi.createResource(values); message.success('创建成功'); }
      setModalOpen(false); fetchData();
    } catch (err: any) { message.error(err.response?.data?.error || '操作失败'); }
  };

  const handleToggleStatus = async (record: any) => {
    const newStatus = record.status === 1 ? 0 : 1;
    try { await adminApi.toggleResourceStatus(record.id, newStatus); message.success(newStatus === 1 ? '已上架' : '已下架'); fetchData(); }
    catch (err: any) { message.error(err.response?.data?.error || '操作失败'); }
  };

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '所需积分', dataIndex: 'pointsRequired', width: 100 },
    { title: '当前库存', dataIndex: 'stock', width: 100 },
    { title: '总库存', dataIndex: 'totalStock', width: 100 },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: number) => <Tag color={s === 1 ? 'green' : 'default'}>{s === 1 ? '上架' : '下架'}</Tag> },
    {
      title: '操作', width: 220,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" onClick={() => handleToggleStatus(record)}>{record.status === 1 ? '下架' : '上架'}</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>
        <GiftOutlined style={{ marginRight: 8 }} />资源管理
      </div>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ marginBottom: 16,
        background: 'linear-gradient(135deg, #a855f7, #7c3aed)', border: 'none' }}>
        新增资源
      </Button>
      <div className="game-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table rowKey="id" columns={columns} dataSource={resources} loading={loading}
          pagination={{ current: page, total, pageSize: 10, onChange: setPage }} />
      </div>
      <Modal title={editingResource ? '编辑资源' : '新增资源'} open={modalOpen}
        onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="pointsRequired" label="所需积分" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="库存" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片URL（可选）"><Input placeholder="https://..." /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
