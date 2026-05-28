import { useState } from 'react';
import { Form, Input, InputNumber, Upload, Button, Card, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { studentApi, uploadApi } from '../../api/endpoints';

const { Title } = Typography;
const { TextArea } = Input;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function StuApply() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      const res = await uploadApi.uploadFile(file);
      const url = res.data.url;
      setEvidenceUrl(url);
      message.success('上传成功');
    } catch {
      message.error('上传失败');
    }
    return false; // Prevent default upload
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await studentApi.submitApplication({
        taskRuleId: values.taskRuleId || undefined,
        taskDescription: values.taskDescription,
        pointsApplied: values.pointsApplied,
        evidenceUrl: evidenceUrl || undefined,
        idempotencyKey: generateId(),
      });
      message.success('积分申请已提交，等待管理员审核');
      form.resetFields();
      setEvidenceUrl(null);
    } catch (err: any) {
      message.error(err.response?.data?.error || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={4}>提交积分申请</Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="taskDescription"
            label="任务描述"
            rules={[{ required: true, message: '请描述你完成的任务' }]}
          >
            <TextArea rows={4} placeholder="请详细描述你在微信群里完成的任务内容，如：转发了XX推文至朋友圈并截图" />
          </Form.Item>

          <Form.Item
            name="pointsApplied"
            label="申请积分"
            rules={[{ required: true, message: '请输入申请积分' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="请输入申请的积分数" />
          </Form.Item>

          <Form.Item label="证明材料（可选）">
            <Upload
              beforeUpload={(file) => {
                handleUpload(file);
                return false;
              }}
              maxCount={1}
              showUploadList={!!evidenceUrl}
            >
              <Button icon={<UploadOutlined />}>上传截图</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              提交申请
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
