import "./App.less";

import { Flex, Layout } from "antd";
import type React from "react";
import TailwindExamples from "./TailwindExamples";

const { Header, Footer, Sider, Content } = Layout;

const App: React.FC = () => (
  <div className="container">
    <div className="card">
      <div className="card-title">Layout Demo</div>
      <div className="card-content">
        <Flex gap="middle" wrap>
          <Layout className="layout-demo">
            <Header className="demo-header">Header</Header>
            <Content className="demo-content">Content</Content>
            <Footer className="demo-footer">Footer</Footer>
          </Layout>

          <Layout className="layout-demo">
            <Header className="demo-header">Header</Header>
            <Layout>
              <Sider width="25%" className="demo-sider">
                Sider
              </Sider>
              <Content className="demo-content">Content</Content>
            </Layout>
            <Footer className="demo-footer">Footer</Footer>
          </Layout>

          <Layout className="layout-demo">
            <Header className="demo-header">Header</Header>
            <Layout>
              <Content className="demo-content">Content</Content>
              <Sider width="25%" className="demo-sider">
                Sider
              </Sider>
            </Layout>
            <Footer className="demo-footer">Footer</Footer>
          </Layout>

          <Layout className="layout-demo">
            <Sider width="25%" className="demo-sider">
              Sider
            </Sider>
            <Layout>
              <Header className="demo-header">Header</Header>
              <Content className="demo-content">Content</Content>
              <Footer className="demo-footer">Footer</Footer>
            </Layout>
          </Layout>
        </Flex>
      </div>
    </div>

    <div className="card">
      <div className="card-title">Button Styles</div>
      <div className="card-content">
        <div className="button-group">
          <button type="button" className="btn btn-primary">
            Primary Button
          </button>
          <button type="button" className="btn btn-success">
            Success Button
          </button>
          <button type="button" className="btn btn-warning">
            Warning Button
          </button>
          <button type="button" className="btn btn-danger">
            Danger Button
          </button>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-title">Grid Layout</div>
      <div className="card-content">
        <div className="row">
          <div className="col col-3">
            <div className="grid-item grid-item-primary">25% Width</div>
          </div>
          <div className="col col-3">
            <div className="grid-item grid-item-success">25% Width</div>
          </div>
          <div className="col col-6">
            <div className="grid-item grid-item-warning">50% Width</div>
          </div>
        </div>
      </div>
    </div>

    <TailwindExamples />
  </div>
);

export default App;
