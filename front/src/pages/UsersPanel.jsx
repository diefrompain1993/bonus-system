import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Layout,
  Table,
  Button,
  Drawer,
  Input,
  message,
  Tooltip,
  Tag,
  Row,
  Col,
  ConfigProvider,
  Space,
  Modal,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  LinkOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import ruRU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useSelector, useDispatch } from "react-redux";

import {
  getAllUsers,
  archiveUser,
  unarchiveUser,
} from "../store/actions/userActions.js";

import UserDrawer from "../components/UserDrawer.jsx";
import AppHeader from "../components/Header.jsx";
import AppFooter from "../components/Footer.jsx";
import "./UsersPanel.css";

const { Content } = Layout;

const UsersDashboard = () => {
  const dispatch = useDispatch();
  const { loading, error, users } = useSelector((state) => state.users);

  // Управление боковой панелью (Drawer)
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Поле поиска по названию БЦ
  const [bcSearch, setBcSearch] = useState("");

  // Ключ для сброса внутренних фильтров/состояния таблицы
  const [tableKey, setTableKey] = useState(0);

  const [showReportModal, setShowReportModal] = useState(false);
  const [ticket, setTicket] = useState(null);

  // Получаем текущего пользователя из Redux
  const currentUser = useSelector((state) => state.auth.user); // Предполагается, что user хранится в state.auth.user
  const userRole = currentUser?.role; // Например: 'admin', 'central_office',

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(`Ошибка: ${error.detail || "Произошла ошибка"}`);
    }
  }, [error]);

  // Фильтрация пользователей по названию бизнес-центра
  const filteredUsers = useMemo(() => {
    if (!bcSearch.trim()) {
      return users;
    }
    const lowerSearch = bcSearch.toLowerCase();
    return users.filter((u) => {
      const bcName = u.business_center?.name?.toLowerCase() || "";
      return bcName.includes(lowerSearch);
    });
  }, [users, bcSearch]);

  // Открытие Drawer для создания
  const handleCreateUser = () => {
    setIsEditMode(false);
    setEditingUser(null);
    setDrawerVisible(true);
  };

  // Открытие Drawer для редактирования
  const handleEditUser = (record) => {
    setIsEditMode(true);
    setEditingUser(record);
    setDrawerVisible(true);
  };

  // Архивировать / Разархивировать
  const handleToggleArchive = async (record) => {
    try {
      if (!record.archived) {
        await dispatch(archiveUser(record.id));
        message.success("Пользователь заархивирован");
      } else {
        await dispatch(unarchiveUser(record.id));
        message.success("Пользователь разархивирован");
      }
    } catch (err) {
      message.error("Ошибка при изменении статуса архива");
    }
  };

  const handleReportModal = (data) => {
    setShowReportModal(true);
    setTicket(data);
  };
  const handleReportOk = () => {
    setShowReportModal(false);
  };

  const handleReportCancel = () => {
    setShowReportModal(false);
  };

  // Рендер статуса
  const renderStatus = useCallback((archived, data) => {
    const status = archived ? "В архиве" : "Активно";
    const statusStyles = {
      width: "85px",
      textAlign: "center",
    };
    const statusMap = {
      Активно: {
        color: "#28a745",
        borderColor: "#28a745",
        backgroundColor: "#e8f5e9",
      },
      "В архиве": {
        color: "#6a1b9a",
        borderColor: "#6a1b9a",
        backgroundColor: "#f3e5f5",
      },
    };
    const style = statusMap[status] || {};
    return (
      <>
        <Tag style={{ ...statusStyles, ...style }}>{status}</Tag>
      </>
    );
  }, []);

  // Колонки таблицы
  // Если вы хотите оставить фильтрацию по "Роль" и "Статус",
  // корректно определите/уберите `filteredValue`.
  const columns = [
    {
      title: "ФИО",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Логин",
      dataIndex: "login",
      key: "login",
      sorter: (a, b) => a.login.localeCompare(b.login),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (val) => val || "—",
      sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
    },
    {
      title: "Телефон",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (val) => val || "—",
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      // Пример встроенного фильтра по роли (уберите, если не нужно):
      // filters: [
      //   { text: "ADMIN", value: "ADMIN" },
      //   { text: "CENTRAL_OFFICE", value: "CENTRAL_OFFICE" },
      //   { text: "BUSINESS_CENTER", value: "BUSINESS_CENTER" },
      //   { text: "ENGINEER", value: "ENGINEER" },
      // ],
      // onFilter: (value, record) => record.role === value,
    },
    {
      title: "БЦ",
      dataIndex: ["business_center", "name"],
      key: "business_center",
      render: (_, record) =>
        record.business_center ? record.business_center.name : "—",
    },
    {
      title: "Должность",
      dataIndex: "job_post",
      key: "job_post",
      render: (val) => val || "—",
    },
    {
      title: "Статус",
      dataIndex: "archived",
      key: "archived",
      render: renderStatus,
      // Пример встроенного фильтра по архиву (уберите, если не нужно):
      // filters: [
      //   { text: "В архиве", value: true },
      //   { text: "Активно", value: false },
      // ],
      // onFilter: (value, record) => record.archived === value,
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <div className="action-buttons">
          <Space>
            <Tooltip title="Редактировать">
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEditUser(record)}
              />
            </Tooltip>
            <Tooltip
              title={record.archived ? "Разархивировать" : "Архивировать"}
            >
              <Button
                icon={
                  record.archived ? <ArrowLeftOutlined /> : <DeleteOutlined />
                }
                danger={!record.archived}
                onClick={() => handleToggleArchive(record)}
              />
            </Tooltip>
          </Space>
        </div>
      ),
    },
  ];

  // Сброс поиска
  const handleResetSearch = () => {
    setBcSearch("");
    setTableKey((prev) => prev + 1);
  };

  // При изменениях таблицы (сортировка, встроенные фильтры и т.д.)
  const handleTableChange = (pagination, filters, sorter) => {
    // Если нужно, можно сохранять/обрабатывать filters и sorter.
  };

  return (
    <ConfigProvider locale={ruRU}>
      <Layout className="dashboard-layout">
        <AppHeader />
        <Content className="dashboard-content">
          <div className="dashboard-header">
            <div className="dashboard-controls">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ width: "100%" }}
                    onClick={handleCreateUser}
                  >
                    Создать
                  </Button>
                </Col>

                {/* Поле поиска по названию БЦ */}
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Input
                    placeholder="Поиск по названию БЦ"
                    value={bcSearch}
                    onChange={(e) => setBcSearch(e.target.value)}
                    allowClear
                  />
                </Col>

                <Col xs={24} sm={24} md={2} lg={1}>
                  <Tooltip title="Сбросить фильтры">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleResetSearch}
                      style={{ width: "100%", minWidth: "40px" }}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </div>
          </div>

          <div className="dashboard-table-container">
            <Table
              key={tableKey}
              loading={loading}
              dataSource={filteredUsers}
              columns={columns}
              rowKey="id"
              scroll={{ y: 540 }}
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                hideOnSinglePage: false,
              }}
              onChange={handleTableChange}
              locale={{
                triggerAsc: "Сортировать по возрастанию",
                triggerDesc: "Сортировать по убыванию",
                cancelSort: "Отменить сортировку",
                emptyText: "Нет пользователей для отображения",
              }}
              className="dashboard-table"
            />
          </div>

          {/* Drawer (создание/редактирование пользователя) */}
          <Drawer
            title={
              isEditMode
                ? `Редактировать: ${editingUser?.name}`
                : "Создать нового пользователя"
            }
            width={window.innerWidth < 768 ? "100%" : 720}
            open={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <UserDrawer
              isEditMode={isEditMode}
              userData={editingUser}
              onClose={() => setDrawerVisible(false)}
            />
          </Drawer>

          <Modal
            title={<span style={{ fontSize: "larger" }}>Отчёт по заявке</span>}
            open={showReportModal}
            onOk={handleReportOk}
            onCancel={handleReportCancel}
            footer={[
              <Button key="close" type="primary" onClick={handleReportCancel}>
                Закрыть
              </Button>,
            ]}
            className="ticket-report-modal"
          >
            <div className="ticket-report-modal-content">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="report-section">
                    <Text strong>Неисправность:</Text>
                    <Text>{ticket?.report_system}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="report-section">
                    <Text strong>Выполненные работы:</Text>
                    <Text>{ticket?.report_summary}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="report-section">
                    <Text strong>
                      <LinkOutlined /> Фото / Видео:
                    </Text>
                    <Space direction="vertical">
                      {ticket?.report_links?.split("\n")?.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                      ))}
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>
          </Modal>
        </Content>
        <AppFooter />
      </Layout>
    </ConfigProvider>
  );
};

export default UsersDashboard;
