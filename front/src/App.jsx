import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TicketDetailPage from "./pages/TicketDetailPage.jsx";
import BcPanel from "./pages/BcPanel.jsx";
import UsersPanelPage from "./pages/UsersPanel.jsx";
import BonusSystemPage from "./pages/BonusSystemPage.jsx";
import { loadUser } from "./store/actions/authActions";
import { Spin, Layout } from "antd";
import AppHeader from "./components/Header";
import "./index.css";

const { Header, Content, Footer } = Layout;

const App = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <Spin size="large" tip="Загрузка..." />
      </div>
    );
  }

  return (
    <Router>
      <Layout style={{ minHeight: "100vh", width: "100%", overflow: "hidden" }}>
        {/* Хедер можно скрыть, если мешает */}
        <Header style={{ background: "#fff", padding: 0 }}>
          <AppHeader />
        </Header>

        <Content style={{ margin: "0", padding: "0" }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/bc-panel" element={<BcPanel />} />
            <Route path="/users-panel" element={<UsersPanelPage />} />
            <Route path="/bonus" element={<BonusSystemPage />} />
          </Routes>
        </Content>

        <Footer style={{ textAlign: "center" }}>
          Telegram Mini App ©2025
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
