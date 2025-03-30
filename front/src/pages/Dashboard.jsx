// src/pages/Dashboard.jsx
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Layout,
  Table,
  Button,
  Drawer,
  message,
  Tooltip,
  Tag,
  DatePicker,
  Row,
  Col,
  Input,
  ConfigProvider,
  Modal,
  Space,
  Typography,
  Select,
} from "antd";
import {
  FileTextOutlined,
  LinkOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import ruRU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useSelector, useDispatch } from "react-redux";
import { getTickets, assignEngineer } from "../store/actions/ticketActions";
import { getEngineers } from "../store/actions/userActions";
import TicketDrawer from "../components/TicketDrawer.jsx";
import AppHeader from "../components/Header.jsx";
import AppFooter from "../components/Footer.jsx";
import "./Dashboard.css";

dayjs.locale("ru");

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  // Состояния для управления Drawer и датой
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  // Состояния для таблицы (фильтры)
  const [filteredSystem, setFilteredSystem] = useState(null);
  const [filteredWorkType, setFilteredWorkType] = useState(null);
  const [filteredEngineer, setFilteredEngineer] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState(null);

  // Состояния для поиска по колонкам таблицы
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Новое состояние для поиска по названию БЦ.
  // При каждом изменении символа таблица будет сразу фильтроваться.
  const [bcSearchText, setBcSearchText] = useState("");

  // Ключ для сброса состояния таблицы
  const [tableKey, setTableKey] = useState(0);

  const dispatch = useDispatch();
  const { tickets, loading, error } = useSelector((state) => state.tickets);
  const { engineers } = useSelector((state) => state.users);

  // Получаем текущего пользователя из Redux
  const currentUser = useSelector((state) => state.auth.user);
  const userRole = currentUser?.role; // например: 'admin', 'central_office', 'business_center', 'engineer'
  const isArchived = currentUser?.archived;

  const [showReportModal, setShowReportModal] = useState(false);
  const [ticket, setTicket] = useState(null);

  // Загрузка заявок и инженеров. Здесь убираем фильтр по бизнес-центру.
  useEffect(() => {
    const filters = {
      // businessCenter не передаём
      dateFrom: dateRange?.[0]
        ? dateRange[0].startOf("day").toISOString()
        : undefined,
      dateTo: dateRange?.[1]
        ? dateRange[1].endOf("day").toISOString()
        : undefined,
    };
    dispatch(getTickets(filters));
    dispatch(getEngineers());
  }, [dispatch, dateRange]);

  // Обработка ошибок
  useEffect(() => {
    if (error) {
      message.error(
        `Ошибка загрузки заявок: ${error.detail || "Неизвестная ошибка"}`
      );
    }
  }, [error]);

  // Отфильтрованные заявки на основе поиска по названию БЦ.
  // Если у заявки задан бизнес-центр и его название содержит введённый текст,
  // то заявка остаётся в списке. Если поле поиска пустое – возвращаются все заявки.
  const filteredTickets = useMemo(() => {
    if (!bcSearchText.trim()) {
      return tickets;
    }
    const lower = bcSearchText.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.business_center &&
        ticket.business_center.name.toLowerCase().includes(lower)
    );
  }, [tickets, bcSearchText]);

  // Вспомогательные: фильтры для систем, типов работ, инженеров
  const systemFilters = useMemo(() => {
    const systems = {};
    tickets.forEach((ticket) => {
      if (ticket.system) {
        systems[ticket.system] = true;
      }
    });
    return Object.keys(systems).map((system) => ({
      text: system,
      value: system,
    }));
  }, [tickets]);

  const workTypeFilters = useMemo(() => {
    const workTypes = {};
    tickets.forEach((ticket) => {
      if (ticket.work_type) {
        workTypes[ticket.work_type] = true;
      }
    });
    return Object.keys(workTypes).map((wt) => ({ text: wt, value: wt }));
  }, [tickets]);

  const engineerFilters = useMemo(() => {
    return engineers.map((engineer) => ({
      text: engineer.name,
      value: engineer.name,
    }));
  }, [engineers]);

  // Назначение инженера
  const handleAssignEngineer = useCallback(
    async (ticketId, engineerId) => {
      try {
        await dispatch(assignEngineer(ticketId, engineerId));
        message.success("Успешно");
        const filters = {
          dateFrom: dateRange?.[0]
            ? dateRange[0].startOf("day").toISOString()
            : undefined,
          dateTo: dateRange?.[1]
            ? dateRange[1].endOf("day").toISOString()
            : undefined,
        };
        dispatch(getTickets(filters));
      } catch {
        message.error("Ошибка при назначении инженера");
      }
    },
    [dispatch, dateRange]
  );

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

  // Отображение статуса (цветные теги)
  const renderStatus = useCallback((status, data) => {
    const statusStyles = {
      width: "85px",
      textAlign: "center",
    };

    const statusMap = {
      Новая: {
        color: "#007bff",
        borderColor: "#007bff",
        backgroundColor: "#e6f7ff",
      },
      "В работе": {
        color: "#28a745",
        borderColor: "#28a745",
        backgroundColor: "#e8f5e9",
      },
      "На паузе": {
        color: "#ffc107",
        borderColor: "#ffc107",
        backgroundColor: "#fffbe6",
      },
      Завершена: {
        color: "#6a1b9a",
        borderColor: "#6a1b9a",
        backgroundColor: "#f3e5f5",
      },
    };

    const style = statusMap[status] || {};
    return (
      <>
        <Tag style={{ ...statusStyles, ...style }}>{status}</Tag>
        {data.google_sheets_row_id && (
          <Tooltip title="Просмотреть отчёт">
            <FileTextOutlined
              style={{
                marginLeft: "5px",
                color: "#6a1b9a",
                fontSize: "16px",
              }}
              onClick={() => handleReportModal(data)}
            />
          </Tooltip>
        )}
      </>
    );
  }, []);

  // --- ЛОГИКА ПОИСКА для колонок таблицы ---
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
    setSearchedColumn("");
  };

  // Кастомная функция для генерации пропов колонки поиска
  const getColumnSearchProps = (
    dataIndex,
    placeholderText = `Поиск ${dataIndex}`
  ) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={placeholderText}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            width: "100%",
            marginBottom: 8,
            display: "block",
            padding: "4px 8px",
          }}
        />
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined style={{ fontSize: "16px" }} />}
              size="small"
              style={{ width: "100%" }}
            >
              Поиск
            </Button>
          </Col>
          <Col span={12}>
            <Button
              onClick={() => handleReset(clearFilters)}
              size="small"
              style={{ width: "100%" }}
            >
              Сброс
            </Button>
          </Col>
        </Row>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{ color: filtered ? "#1890ff" : undefined, fontSize: "16px" }}
      />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      if (!recordValue) return false;
      return recordValue.toString().toLowerCase().includes(value.toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: "#ffc069", padding: 0 }}>{text}</span>
      ) : (
        text
      ),
  });

  // Определяем колонки таблицы
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "Дата",
        dataIndex: "created_at",
        key: "created_at",
        sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        sortDirections: ["descend", "ascend"],
        render: (date) =>
          new Date(date).toLocaleString("ru-RU", {
            timeZone: "Europe/Moscow",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
      },
      {
        title: "Заявка",
        dataIndex: "id",
        key: "ticket",
        ...getColumnSearchProps("id", "Поиск по заявке"),
        filteredValue:
          searchedColumn === "id" && searchText ? [searchText] : null,
        render: (id, record) => (
          <a href={`/tickets/${id}`}>
            Чат по заявке <br />{" "}
            <span style={{ whiteSpace: "nowrap" }}>
              {new Date(record.created_at).getTime()}-{id}
            </span>
          </a>
        ),
      },
      {
        title: "Система",
        dataIndex: "system",
        key: "system",
        filters: systemFilters,
        filteredValue: filteredSystem || null,
        onFilter: (value, record) => record.system === value,
        sorter: (a, b) => a.system.localeCompare(b.system),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Вид работы",
        dataIndex: "work_type",
        key: "work_type",
        filters: workTypeFilters,
        filteredValue: filteredWorkType || null,
        onFilter: (value, record) => record.work_type === value,
        sorter: (a, b) => a.work_type.localeCompare(b.work_type),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Описание",
        dataIndex: "description",
        key: "description",
        ...getColumnSearchProps("description", "Поиск описания"),
        filteredValue:
          searchedColumn === "description" && searchText ? [searchText] : null,
        render: (text) => (
          <Tooltip
            placement="top"
            title={
              <div style={{ maxWidth: "600px", whiteSpace: "pre-wrap" }}>
                {text}
              </div>
            }
          >
            <span
              style={{
                display: "inline-block",
                maxWidth: "200px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
              }}
            >
              {text && text.length > 30
                ? `${text.substring(0, 30)}...`
                : text || null}
            </span>
          </Tooltip>
        ),
        sorter: (a, b) =>
          (a.description || "").localeCompare(b.description || ""),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        render: renderStatus,
        filters: [
          { text: "Новая", value: "Новая" },
          { text: "В работе", value: "В работе" },
          { text: "На паузе", value: "На паузе" },
          { text: "Завершена", value: "Завершена" },
        ],
        filteredValue: filteredStatus || null,
        onFilter: (value, record) => record.status === value,
        sorter: (a, b) => a.status.localeCompare(b.status),
        sortDirections: ["ascend", "descend"],
      },
    ];

    // Колонки для ADMIN и CENTRAL_OFFICE
    const adminColumns = [
      {
        title: "БЦ",
        dataIndex: ["business_center", "name"],
        key: "business_center",
        render: (text, record) =>
          record.business_center ? record.business_center.name : "Не указано",
      },
    ];

    // Колонка для назначения инженера (ADMIN и CENTRAL_OFFICE)
    const engineerColumn = {
      title: "Инженер",
      dataIndex: "assigned_engineer",
      key: "assigned_engineer",
      render: (engineer, record) => (
        <Select
          value={engineer ? engineer.id : undefined}
          onChange={(value) => handleAssignEngineer(record.id, value)}
          style={{ width: 150 }}
          placeholder="Назначить инженера"
        >
          <Option value={null}>Не назначен</Option>
          {engineers.map((eng) => (
            <Option key={eng.id} value={eng.id}>
              {eng.name}
            </Option>
          ))}
        </Select>
      ),
      filters: engineerFilters,
      filteredValue: filteredEngineer || null,
      onFilter: (value, record) => record.assigned_engineer?.name === value,
      sorter: (a, b) => {
        const nameA = a.assigned_engineer?.name.toLowerCase() || "";
        const nameB = b.assigned_engineer?.name.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      },
      sortDirections: ["ascend", "descend"],
    };

    // Колонка для отображения контактного лица (для BUSINESS_CENTER и CENTRAL_OFFICE)
    const contactNameColumn = {
      title: "Контактное лицо",
      dataIndex: "contact_name",
      key: "contact_name",
      ...getColumnSearchProps("contact_name", "Поиск по ФИО"),
      filteredValue:
        searchedColumn === "contact_name" && searchText ? [searchText] : null,
      render: (text) => <span>{text}</span>,
      sorter: (a, b) =>
        (a.contact_name || "").localeCompare(b.contact_name || ""),
      sortDirections: ["ascend", "descend"],
    };

    let finalColumns = [...baseColumns];
    if (userRole === "admin") {
      finalColumns = [...adminColumns, ...finalColumns, engineerColumn];
    } else if (userRole === "business_center") {
      finalColumns = [...finalColumns, contactNameColumn];
    } else if (userRole === "central_office") {
      finalColumns = [...adminColumns, ...finalColumns, contactNameColumn];
    }

    return finalColumns;
  }, [
    systemFilters,
    workTypeFilters,
    engineerFilters,
    engineers,
    filteredSystem,
    filteredWorkType,
    filteredEngineer,
    filteredStatus,
    searchText,
    searchedColumn,
    handleAssignEngineer,
    renderStatus,
    userRole,
  ]);

  const handleResetFilters = () => {
    setDateRange(null);
    setFilteredSystem(null);
    setFilteredWorkType(null);
    setFilteredEngineer(null);
    setFilteredStatus(null);
    setSearchText("");
    setSearchedColumn("");
    setBcSearchText("");
    setTableKey((prev) => prev + 1);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredSystem(filters.system || null);
    setFilteredWorkType(filters.work_type || null);
    setFilteredEngineer(filters.assigned_engineer || null);
    setFilteredStatus(filters.status || null);
  };

  return (
    <ConfigProvider locale={ruRU}>
      <Layout className="dashboard-layout">
        <AppHeader />
        <Content className="dashboard-content">
          <div className="dashboard-header">
            <div className="dashboard-controls">
              <Row gutter={[16, 16]} align="middle" justify="center">
                {/* Кнопка "Создать заявку" */}
                {!isArchived && (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={4}
                  >
                    <Button
                      type="primary"
                      onClick={() => setDrawerVisible(true)}
                      className="create-ticket-button"
                      icon={<PlusOutlined />}
                      style={{ width: "100%" }}
                    >
                      Создать заявку
                    </Button>
                  </Col>
                )}

                {/* Поле поиска по названию БЦ */}
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Input
                    placeholder="Поиск по названию БЦ"
                    value={bcSearchText}
                    onChange={(e) => setBcSearchText(e.target.value)}
                    allowClear
                  />
                </Col>

                {/* Датапикер (русский) */}
                <Col xs={24} sm={12} md={14} lg={8}>
                  <RangePicker
                    style={{ width: "100%" }}
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                    format="DD.MM.YYYY"
                    locale={ruRU}
                    allowEmpty={[true, true]}
                    placeholder={["Начальная дата", "Конечная дата"]}
                  />
                </Col>

                {/* Кнопка "Сбросить фильтры" */}
                <Col xs={24} sm={24} md={2} lg={1}>
                  <Tooltip title="Сбросить фильтры">
                    <Button
                      onClick={handleResetFilters}
                      className="reset-filters-button"
                      icon={<ReloadOutlined />}
                      style={{
                        width: "100%",
                        minWidth: "40px",
                        padding: "5px",
                      }}
                    >
                      <span className="reset-filters-text">
                        Сбросить фильтры
                      </span>
                    </Button>
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
              dataSource={filteredTickets}
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
                emptyText: "Нет заявок для отображения",
              }}
              className="dashboard-table"
            />
          </div>

          {/* Drawer для создания заявки */}
          <Drawer
            title="Создать новую заявку"
            width={window.innerWidth < 768 ? "100%" : 720}
            open={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <TicketDrawer onClose={() => setDrawerVisible(false)} />
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
                {ticket?.report_links &&
                  ticket.report_links.trim() !== "" && (
                    <Col span={24}>
                      <div className="report-section">
                        <Text strong>
                          <LinkOutlined /> Фото / Видео:
                        </Text>
                        <Space direction="vertical">
                          {ticket.report_links
                            .split("\n")
                            .filter((link) => link.trim() !== "")
                            .map((link, idx) => (
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
                  )}
              </Row>
            </div>
          </Modal>
        </Content>
        <AppFooter />
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;
