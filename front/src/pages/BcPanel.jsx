import React, { useEffect, useState, useMemo } from "react";
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
  FileTextOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import ruRU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useSelector, useDispatch } from "react-redux";

// Пример экшенов для БЦ
import {
  getBusinessCenters,
  archiveBusinessCenter,
  unarchiveBusinessCenter,
} from "../store/actions/businessCenterActions";
import BcPanelDrawer from "../components/BcPanelDrawer";
import AppHeader from "../components/Header";
import AppFooter from "../components/Footer";

import "./Dashboard.css";

dayjs.locale("ru");

const { Content } = Layout;

const BcPanel = () => {
  const dispatch = useDispatch();

  // Данные из Redux
  const { businessCenters, loading, error } = useSelector(
    (state) => state.businessCenters
  );

  // Drawer: редактирование/создание
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingBc, setEditingBc] = useState(null);

  // Поле поиска по названию БЦ
  const [searchText, setSearchText] = useState("");

  // Ключ для сброса состояния таблицы
  const [tableKey, setTableKey] = useState(0);

  const [showReportModal, setShowReportModal] = useState(false);
  const [ticket, setTicket] = useState(null);

  // Получаем текущего пользователя из Redux
  const currentUser = useSelector((state) => state.auth.user); // Предполагается, что user хранится в state.auth.user
  const userRole = currentUser?.role; // Например: 'admin', 'central_office',

  useEffect(() => {
    dispatch(getBusinessCenters());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(`Ошибка при загрузке БЦ: ${error.detail || ""}`);
    }
  }, [error]);

  // Фильтрация по названию БЦ (Search)
  const filteredBCs = useMemo(() => {
    if (!searchText.trim()) {
      return businessCenters;
    }
    const lower = searchText.toLowerCase();
    return businessCenters.filter((bc) =>
      bc.name.toLowerCase().includes(lower)
    );
  }, [businessCenters, searchText]);

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

  // Рендер статуса (archived)
  const renderStatus = (archived, data) => {
    const status = archived ? "В архиве" : "Активно";
    const styleMap = {
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
    return (
      <>
        <Tag style={{ width: 80, textAlign: "center", ...styleMap[status] }}>
          {status}
        </Tag>
      </>
    );
  };

  // Обработчик "Редактировать"
  const handleEditBc = (bcRecord) => {
    setEditingBc(bcRecord);
    setDrawerVisible(true);
  };

  // Архивировать / Разархивировать
  const handleToggleArchive = async (bcRecord) => {
    try {
      if (!bcRecord.archived) {
        await dispatch(archiveBusinessCenter(bcRecord.id));
        message.success(`БЦ "${bcRecord.name}" заархивирован`);
      } else {
        await dispatch(unarchiveBusinessCenter(bcRecord.id));
        message.success(`БЦ "${bcRecord.name}" разархивирован`);
      }
    } catch (err) {
      message.error("Ошибка при изменении статуса");
    }
  };

  // Колонки таблицы
  // Убираем `filters` и `filteredValue`, если они не нужны
  // (чтобы не было предупреждения [antd: Table]).
  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Адрес",
      dataIndex: "address",
      key: "address",
      render: (val) => (val ? val : "—"),
    },
    {
      title: "Статус",
      dataIndex: "archived",
      key: "archived",
      render: renderStatus,
      // Пример, если хотите оставить встроенный фильтр:
      // filters: [
      //   { text: "Активно", value: false },
      //   { text: "В архиве", value: true },
      // ],
      // onFilter: (value, record) => record.archived === value,
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => {
        const archived = record.archived;
        return (
          <div className="action-buttons">
            <Space>
              {/* Кнопка "Редактировать" */}
              <Tooltip title="Редактировать">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEditBc(record)}
                />
              </Tooltip>
              {/* Кнопка "Архивировать" / "Разархивировать" */}
              <Tooltip title={archived ? "Разархивировать" : "Архивировать"}>
                <Button
                  icon={archived ? <ArrowLeftOutlined /> : <DeleteOutlined />}
                  danger={!archived}
                  onClick={() => handleToggleArchive(record)}
                />
              </Tooltip>
            </Space>
          </div>
        );
      },
    },
  ];

  // Сброс поиска
  const handleResetSearch = () => {
    setSearchText("");
    setTableKey((prev) => prev + 1);
  };

  return (
    <ConfigProvider locale={ruRU}>
      <Layout className="dashboard-layout">
        <AppHeader />
        <Content className="dashboard-content">
          <div className="dashboard-header">
            <div className="dashboard-controls">
              <Row gutter={[16, 16]} align="middle">
                {/* Кнопка "Создать" */}
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ width: "100%" }}
                    onClick={() => {
                      setEditingBc(null);
                      setDrawerVisible(true);
                    }}
                  >
                    Создать
                  </Button>
                </Col>

                {/* Поле поиска по названию БЦ */}
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Input
                    placeholder="Поиск по названию БЦ"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>

                {/* Кнопка "Сбросить" */}
                <Col xs={24} sm={12} md={2} lg={1}>
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

          {/* Таблица */}
          <div className="dashboard-table-container">
            <Table
              key={tableKey}
              loading={loading}
              dataSource={filteredBCs}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                hideOnSinglePage: false,
              }}
              scroll={{ y: 540 }}
              locale={{
                triggerAsc: "Сортировать по возрастанию",
                triggerDesc: "Сортировать по убыванию",
                cancelSort: "Отменить сортировку",
                emptyText: "Нет бизнес-центров для отображения",
              }}
              className="dashboard-table"
            />
          </div>

          {/* Drawer для создания/редактирования */}
          <Drawer
            title={
              editingBc ? `Редактировать: ${editingBc.name}` : "Создать БЦ"
            }
            width={window.innerWidth < 768 ? "100%" : 720}
            open={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <BcPanelDrawer
              onClose={() => setDrawerVisible(false)}
              editingBc={editingBc}
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

export default BcPanel;
