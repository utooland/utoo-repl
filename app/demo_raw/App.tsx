import './App.less';
import React, { type FC, useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Tag, Row, Col, Progress, Table, Modal } from 'antd';
import { 
  RocketOutlined, 
  ThunderboltOutlined, 
  AppstoreOutlined, 
  SettingOutlined,
  CloudServerOutlined,
  GlobalOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import TailwindExamples from './TailwindExamples';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const App: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between border-b border-white/5 px-6">
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-lg flex-shrink-0 flex items-center justify-center">
            <RocketOutlined className="text-white text-lg" />
          </div>
          <Title level={4} className="!m-0 !text-white tracking-widest font-black whitespace-nowrap">UTOO CORE</Title>
        </div>
        
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']}
          className="flex-1 justify-center border-none"
          items={[
            { key: '1', label: 'Dashboard', icon: <AppstoreOutlined /> },
            { key: '2', label: 'Network', icon: <GlobalOutlined /> },
            { key: '3', label: 'Resources', icon: <CloudServerOutlined /> },
          ]}
        />

        <Space gap="small">
          <Button type="text" icon={<SettingOutlined />} className="text-slate-400" />
          <Button 
            className="btn-cyber-primary border-none bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
            onClick={() => setIsModalOpen(true)}
          >
            Launch Instance
          </Button>
        </Space>
      </Header>

      <Content className="p-8 max-w-[1400px] mx-auto w-full space-y-8">
        {/* Top Feature Banner using Tailwind */}
        <div className="relative p-10 rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent blur-3xl group-hover:from-cyan-500/20 transition-all duration-1000" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <Tag color="cyan" className="uppercase tracking-widest font-bold">Wasm Edge Computing</Tag>
              <h2 className="text-5xl font-black leading-tight bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">
                Deploy Serverless <br/> Architecture in Seconds.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Experience the next generation of web development with our Turbopack-based 
                compilation engine. Local speed, cloud power.
              </p>
              <div className="flex gap-4">
                <Button size="large" type="primary" className="bg-cyan-500 border-none px-8 font-bold hover:!bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  Get Started
                </Button>
                <Button size="large" ghost className="border-slate-700 text-slate-300 font-bold hover:!text-white hover:!border-white">
                  Documentation
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'System Load', val: 32, unit: '%', color: '#06b6d4' },
                { label: 'Memory Usage', val: 56, unit: '%', color: '#a855f7' }
              ].map(stat => (
                <div key={stat.label} className="cyber-card">
                  <div className="title">{stat.label}</div>
                  <div className="stat-value">{stat.val}{stat.unit}</div>
                  <Progress percent={stat.val} strokeColor={stat.color} showInfo={false} className="mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Grid Section */}
        <Row gutter={[24, 24]}>
          <Col lg={16} md={24} className="w-full">
            <div className="cyber-card h-full">
              <div className="title">Active Deployments (Antd Table)</div>
              <Table 
                dataSource={[
                  { key: '1', name: 'api-gateway-v2', status: 'Online', perf: 98, region: 'Tokyo' },
                  { key: '2', name: 'auth-service', status: 'Standby', perf: 100, region: 'Oregon' },
                  { key: '3', name: 'matrix-processor', status: 'Online', perf: 85, region: 'Frankfurt' },
                ]}
                pagination={false}
                className="custom-table"
                columns={[
                  { title: 'Project Name', dataIndex: 'name', key: 'name', render: (t) => <Text className="!text-white font-semibold">{t}</Text> },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Online' ? 'cyan' : 'default'}>{s}</Tag> },
                  { title: 'Performance', dataIndex: 'perf', key: 'perf', render: (p) => <Progress percent={p} size="small" strokeColor={p > 90 ? '#06b6d4' : '#a855f7'} /> },
                ]}
              />
            </div>
          </Col>
          <Col lg={8} md={24} className="w-full">
             <div className="cyber-card bg-gradient-to-br from-slate-900 to-black h-full">
                <div className="title">Tailwind & Effects</div>
                <TailwindExamples />
             </div>
          </Col>
        </Row>
      </Content>

      <Modal 
        title={<span className="text-white tracking-widest uppercase">System Initialization</span>}
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="cyber-modal"
        centered
      >
        <div className="py-6 space-y-4">
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center gap-4">
            <ThunderboltOutlined className="text-cyan-400 text-2xl" />
            <div>
              <div className="text-white font-bold">High Precision Runtime</div>
              <div className="text-slate-500 text-xs">Allocating 4 vCPUs and 8GB RAM for optimized Wasm performance.</div>
            </div>
          </div>
          <Button block type="primary" size="large" className="bg-cyan-500 border-none font-bold" onClick={() => setIsModalOpen(false)}>
            Confirm Deployment
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default App;
