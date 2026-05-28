import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/endpoints';

const { Title } = Typography;

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [form] = Form.useForm();
  const [manualForm] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    adminApi.getStudents({ page, pageSize: 20, keyword: keyword || undefined })
      .then((res) => {
        setStudents(res.data.list);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleCreate = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingStudent(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      if (editingStudent) {
        await adminApi.updateStudent(editingStudent.id, values);
        message.success('更新成功');
      } else {
        await adminApi.createStudent(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    }
  };

  const handleToggleStatus = async (record: any) => {
    const newStatus = record.status === 1 ? 0 : 1;
    try {
      await adminApi.toggleStudentStatus(record.id, newStatus);
      message.success(newStatus === 1 ? '已启用' : '已禁用');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    }
  };

  const handleManualPoints = (record: any) => {
    setSelectedStudent(record);
    manualForm.resetFields();
    setManualModalOpen(true);
  };

  const handleManualSubmit = async (values: any) => {
    try {
      await adminApi.manualPoints(selectedStudent.id, values);
      message.success('操作成功');
      setManualModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '学号', dataIndex: 'studentNo', width: 120 },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (s: number) => <Tag color={s === 1 ? 'green' : 'red'}>{s === 1 ? '正常' : '禁用'}</Tag>,
    },
    { title: '累计获得', dataIndex: 'totalEarned', width: 100 },
    { title: '累计消耗', dataIndex: 'totalSpent', width: 100 },
    { title: '当前积分', width: 100, render: (_: any, r: any) => r.totalEarned - r.totalSpent },
    { title: '注册时间', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
    {
      title: '操作', width: 280,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" onClick={() => handleManualPoints(record)}>加减分</Button>
          <Button size="small" danger={record.status === 1} onClick={() => handleToggleStatus(record)}>
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>学生管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索姓名/学号"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => { setPage(1); fetchData(); }}
          style={{ width: 200 }}
        />
        <Button onClick={() => { setPage(1); fetchData(); }}>搜索</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增学生</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={students}
        loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
        scroll={{ x: 900 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingStudent ? '编辑学生' : '新增学生'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="studentNo" label="学号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Manual Points Modal */}
      <Modal
        title={`手动调整积分 - ${selectedStudent?.name}`}
        open={manualModalOpen}
        onCancel={() => setManualModalOpen(false)}
        onOk={() => manualForm.submit()}
      >
        <Form form={manualForm} layout="vertical" onFinish={handleManualSubmit}>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Input placeholder="earn=加分 / spend=扣分" />
          </Form.Item>
          <Form.Item name="amount" label="数量" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="remark" label="备注" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
