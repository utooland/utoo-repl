export const demoFiles = {
  "src/index.tsx": `
  import { createRoot } from 'react-dom/client';
import App from './app';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}
createRoot(root).render(<App />);
`,
  "src/app.tsx": `
  import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Alert,
  App as AntdApp,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Drawer,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Modal,
  notification,
  Progress,
  Rate,
  Row,
  Select,
  Slider,
  Space,
  Spin,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  theme,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface TableData {
  key: number;
  name: string;
  age: number;
  address: string;
  status: 'active' | 'inactive' | 'pending';
}

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
}

function App(): JSX.Element {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  const menuItems: MenuProps['items'] = [
    { key: '1', icon: <HomeOutlined />, label: '首页' },
    { key: '2', icon: <UserOutlined />, label: '用户管理' },
    { key: '3', icon: <SettingOutlined />, label: '系统设置' },
  ];

  const tableData: TableData[] = Array.from({ length: 50 }, (_, i) => ({
    key: i,
    name: "用户 " +(i + 1),
    age: 20 + (i % 50),
    address: "地址 "+(i + 1),
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'pending',
  }));

  const columns: ColumnsType<TableData> = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'processing'}
          text={status === 'active' ? '活跃' : status === 'inactive' ? '非活跃' : '待处理'}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TableData) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleFormSubmit = (values: any): void => {
    console.log('表单提交:', values);
    message.success('表单提交成功！');
    setModalVisible(false);
    form.resetFields();
  };

  const showNotification = (): void => {
    notification.open({
      message: '通知标题',
      description: '这是一个通知的描述信息。',
      icon: <StarOutlined style={{ color: '#108ee9' }} />,
    });
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <AntdApp>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
            <div
              style={{
                height: 32,
                margin: 16,
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}>
              {collapsed ? 'TS' : 'TypeScript'}
            </div>
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menuItems} />
          </Sider>

          <Layout>
            <Header
              style={{
                padding: '0 24px',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Title level={3} style={{ margin: 0 }}>
                Antd 综合组件展示
              </Title>
              <Space>
                <Button type="primary" icon={<PlusOutlined />}>
                  新建
                </Button>
                <Button icon={<SearchOutlined />}>搜索</Button>
              </Space>
            </Header>

            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="基础组件" key="1">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card title="表单组件" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Input placeholder="输入框" />
                          <Select placeholder="选择器" style={{ width: '100%' }}>
                            <Option value="option1">选项1</Option>
                            <Option value="option2">选项2</Option>
                          </Select>
                          <DatePicker style={{ width: '100%' }} />
                          <Switch defaultChecked />
                          <Slider defaultValue={30} />
                          <Rate defaultValue={3} />
                        </Space>
                      </Card>
                    </Col>

                    <Col span={8}>
                      <Card title="数据展示" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Progress percent={70} />
                          <Badge count={5}>
                            <Avatar icon={<UserOutlined />} />
                          </Badge>
                          <Statistic title="活跃用户" value={1128} />
                          <Alert message="成功提示" type="success" />
                        </Space>
                      </Card>
                    </Col>

                    <Col span={8}>
                      <Card title="反馈组件" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Button type="primary" onClick={showNotification}>
                            显示通知
                          </Button>
                          <Button
                            onClick={() => {
                              setModalVisible(true);
                            }}>
                            打开模态框
                          </Button>
                          <Button
                            onClick={() => {
                              setDrawerVisible(true);
                            }}>
                            打开抽屉
                          </Button>
                          <Spin size="small" />
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane tab="数据表格" key="2">
                  <Card>
                    <Table columns={columns} dataSource={tableData} pagination={{ pageSize: 10 }} scroll={{ y: 400 }} />
                  </Card>
                </TabPane>

                <TabPane tab="其他组件" key="3">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card title="时间轴" size="small">
                        <Timeline>
                          <Timeline.Item>创建项目</Timeline.Item>
                          <Timeline.Item>完成设计</Timeline.Item>
                          <Timeline.Item>开始开发</Timeline.Item>
                          <Timeline.Item>测试完成</Timeline.Item>
                        </Timeline>
                      </Card>
                    </Col>

                    <Col span={12}>
                      <Card title="步骤条" size="small">
                        <Steps
                          current={1}
                          items={[
                            { title: '开始', description: '项目启动' },
                            { title: '进行中', description: '开发阶段' },
                            { title: '完成', description: '项目交付' },
                          ]}
                        />
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </Content>
          </Layout>
        </Layout>

        <Modal
          title="表单模态框"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
          }}
          footer={null}>
          <Form form={form} onFinish={handleFormSubmit} layout="vertical">
            <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]}>
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <TextArea rows={4} placeholder="请输入描述" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                  }}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Drawer
          title="设置抽屉"
          placement="right"
          open={drawerVisible}
          onClose={() => {
            setDrawerVisible(false);
          }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>这是一个设置抽屉</Text>
            <Switch defaultChecked />
            <Slider defaultValue={50} />
            <Rate defaultValue={4} />
          </Space>
        </Drawer>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;

  `,
  "utoopack.json": JSON.stringify(
    {
      "entry": [{ "import": "./src/index.tsx", "name": "index" }],
      "optimization": { "minify": false },
      "stats": true
    },
    null,
    2,
  ),
  "package.json": JSON.stringify(
    {
      name: "utoo-wasm-demo",
      "dependencies": {
        "@ant-design/icons": "^5.2.0",
        "antd": "latest",
        "dayjs": "^1.11.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      "devDependencies": {
        "@types/react": "^18.2.67",
        "@types/react-dom": "^18.2.22"
      }
    },
    null,
    2,
  ),
};
