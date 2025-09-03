export const demoFiles = {
  "src/index.tsx": `
import React from 'react';
import { createRoot } from 'react-dom/client';
import Demo from './demo';

createRoot(document.getElementById('root')).render(<Demo />);
`,
  "src/demo.tsx": `
import React from 'react';

import { Flex, Layout } from 'antd';

const { Header, Footer, Sider, Content } = Layout;

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 48,
  lineHeight: '64px',
  backgroundColor: '#4096ff',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#0958d9',
};

const siderStyle: React.CSSProperties = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#1677ff',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#4096ff',
};

const layoutStyle = {
  borderRadius: 8,
  overflow: 'hidden',
  width: 'calc(50% - 8px)',
  maxWidth: 'calc(50% - 8px)',
};

const App: React.FC = () => (
  <Flex gap="middle" wrap>
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>Header</Header>
      <Content style={contentStyle}>Content</Content>
      <Footer style={footerStyle}>Footer</Footer>
    </Layout>

    <Layout style={layoutStyle}>
      <Header style={headerStyle}>Header</Header>
      <Layout>
      <Sider width="25%" style={siderStyle}>
      Sider
      </Sider>
      <Content style={contentStyle}>Content</Content>
      </Layout>
      <Footer style={footerStyle}>Footer</Footer>
    </Layout>

    <Layout style={layoutStyle}>
      <Header style={headerStyle}>Header</Header>
      <Layout>
      <Content style={contentStyle}>Content</Content>
      <Sider width="25%" style={siderStyle}>
      Sider
      </Sider>
      </Layout>
      <Footer style={footerStyle}>Footer</Footer>
    </Layout>

    <Layout style={layoutStyle}>
      <Sider width="25%" style={siderStyle}>
      Sider
      </Sider>
      <Layout>
      <Header style={headerStyle}>Header</Header>
      <Content style={contentStyle}>Content</Content>
      <Footer style={footerStyle}>Footer</Footer>
      </Layout>
    </Layout>
  </Flex>
);

export default App;
`,
  "utoopack.json": JSON.stringify(
    {
      entry: [
        {
          import: "./src/index.tsx",
          name: "index",
        },
      ],
      stats: true,
    },
    null,
    2,
  ),
  "package.json": JSON.stringify(
    {
      name: "utoo-wasm-demo",
      version: "",
      dependencies: {
        "react-dom": "18.2.0",
        antd: "latest",
        react: "18.2.0",
      },
      devDependencies: {
        "@types/react": "^18.2.67",
        "@types/react-dom": "^18.2.22",
      },
    },
    null,
    2,
  ),
};

