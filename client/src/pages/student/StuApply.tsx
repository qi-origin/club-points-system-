import { useState } from 'react';
import { Form, Input, InputNumber, Upload, Button, message } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import { studentApi, uploadApi } from '../../api/endpoints';

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
    return false;
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
      <div className="game-title" style={{ marginBottom: 20, fontSize: 18 }}>
        <SendOutlined style={{ marginRight: 8 }} />
        提交任务申请
      </div>

      <div className="game-card" style={{ padding: 28 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="taskDescription"
            label={<span style={{ color: '#ccc', fontWeight: 600 }}>任务描述</span>}
            rules={[{ required: true, message: '请描述你完成的任务' }]}
          >
            <TextArea
              rows={4}
              placeholder="详细描述你在微信群里完成的任务内容..."
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(0,212,255,0.2)',
                color: '#e0e0f0',
                borderRadius: 8,
              }}
            />
          </Form.Item>

          <Form.Item
            name="pointsApplied"
            label={<span style={{ color: '#ccc', fontWeight: 600 }}>申请积分</span>}
            rules={[{ required: true, message: '请输入申请积分' }]}
          >
            <InputNumber
              min={1} max={100}
              style={{ width: '100%' }}
              placeholder="输入申请积分数"
              styles={{ input: { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,212,255,0.2)', color: '#e0e0f0' } }}
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: '#ccc', fontWeight: 600 }}>证明材料（可选）</span>}>
            <Upload
              beforeUpload={(file) => { handleUpload(file); return false; }}
              maxCount={1}
              showUploadList={!!evidenceUrl}
            >
              <Button
                icon={<UploadOutlined />}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(168,85,247,0.25)',
                  color: '#a855f7',
                  borderRadius: 8,
                }}
              >
                上传截图
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={<SendOutlined />}
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 2,
                fontFamily: 'Orbitron, "Microsoft YaHei", sans-serif',
                background: 'linear-gradient(135deg, #00d4ff, #0891b2)',
                border: 'none',
                boxShadow: '0 0 25px rgba(0, 212, 255, 0.2)',
              }}
            >
              提交申请
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
