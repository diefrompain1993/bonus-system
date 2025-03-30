import React, { useState, useCallback } from "react";
import {
  Typography,
  Divider,
  Select,
  Modal,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Space,
} from "antd";
import {
  CloseOutlined,
  FileTextOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import api from "../utils/api"; // ваш axios-инстанс

import "./TicketDetails.css";

const { Title, Text } = Typography;
const { Option } = Select;

const TicketDetails = ({
  ticket,
  formattedTicketId,
  handleStatusChange, // Функция, передаваемая из родительского компонента для смены статуса
  handleEngineerChange,
  user,
  engineers,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Определяем, является ли пользователь представителем бизнес-центра
  const isBusinessCenter = user?.role === "business_center";

  const handleClose = useCallback(() => {
    window.location.href = "https://sibeeria.ru";
  }, []);

  // Рендер тэга статуса
  const renderStatusTag = useCallback((status) => {
    const statusMap = {
      Новая: {
        color: "#007bff",
        border: "1px solid #007bff",
        backgroundColor: "#e6f7ff",
      },
      "В работе": {
        color: "#28a745",
        border: "1px solid #28a745",
        backgroundColor: "#e8f5e9",
      },
      "На паузе": {
        color: "#ffc107",
        border: "1px solid #ffc107",
        backgroundColor: "#fffbe6",
      },
      Завершена: {
        color: "#41208F",
        border: "1px solid #41208F",
        backgroundColor: "#F3E5F5",
      },
    };
    const style = statusMap[status] || {};
    return (
      <div className="ticket-status" style={style}>
        {status}
      </div>
    );
  }, []);

  // Возможность редактировать статус (для admin, engineer, central_office)
  const canEditStatus = ["admin", "engineer"].includes(
    user?.role
  );

  // Возможность менять инженера (только для admin)
  const canEditEngineer = user?.role === "admin";

  // Блок "Отчёт" показывается для admin, если статус заявки "Завершена"
  const canShowReportBlock = user.role === "admin" && ticket.status === "Завершена";

  // Если заполнен google_sheets_row_id – считаем, что отчёт существует
  const hasReport = !!ticket.google_sheets_row_id;

  // Открытие модального окна для создания/редактирования отчёта
  const openModal = useCallback(() => {
    setIsModalVisible(true);
    form.setFieldsValue({
      report_system: ticket.report_system || "",
      report_summary: ticket.report_summary || "",
      report_links: ticket.report_links || "",
    });
  }, [ticket, form]);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // Обработка смены статуса с использованием handleStatusChange из родительского компонента
  // Если текущий статус "Завершена", отчёт существует и новый статус не "Завершена":
  // 1. Сначала "удаляем" отчёт (отправляем POST-запрос с полями, установленными в null)
  // 2. Затем вызываем handleStatusChange для смены статуса
  const onStatusChangeHandler = useCallback(
    (value) => {
      if (ticket.status === "Завершена" && hasReport && value !== "Завершена") {
        Modal.confirm({
          title: "Вы уверены, что хотите поменять статус?",
          content: "Это удалит текущий отчёт",
          okText: "Да",
          cancelText: "Нет",
          onOk: async () => {
            try {
              setIsLoading(true);
              // "Удаляем" отчёт
              const deleteResponse = await api.post(`/uploads/${ticket.id}/report`, {
                report_system: null,
                report_summary: null,
                report_links: null,
                google_sheets_row_id: null,
              });
              if (deleteResponse.status !== 200 && deleteResponse.status !== 201) {
                throw new Error("Ошибка при удалении отчёта");
              }
              // Меняем статус через функцию handleStatusChange, переданную из родительского компонента
              await handleStatusChange(value);
              setTimeout(() => {
                window.location.reload();
              }, 300);
            } catch (error) {
              console.error(error);
              message.error("Ошибка при изменении статуса");
            } finally {
              setIsLoading(false);
            }
          },
        });
      } else {
        (async () => {
          try {
            setIsLoading(true);
            await handleStatusChange(value);
          } catch (error) {
            console.error(error);
            message.error("Ошибка при изменении статуса");
          } finally {
            setIsLoading(false);
          }
        })();
      }
    },
    [ticket, hasReport, handleStatusChange]
  );

  // Обработка изменения инженера
  const onEngineerChangeHandler = useCallback(
    (engineerId) => {
      handleEngineerChange(engineerId);
    },
    [handleEngineerChange]
  );

  // Обработка отправки формы для создания/редактирования отчёта
  const onFinish = async (values) => {
    const trimmedSystem = values.report_system.trim();
    const trimmedSummary = values.report_summary.trim();
    const trimmedLinks = values.report_links ? values.report_links.trim() : "";

    // Если отчёт существует и поля отчёта очищены – предупреждаем, что отчёт будет удалён
    if (hasReport && trimmedSystem === "" && trimmedSummary === "") {
      Modal.confirm({
        title: "Ничего не заполнено",
        content: "Отчёт будет удалён. Продолжить?",
        okText: "Да",
        cancelText: "Нет",
        onOk: async () => {
          try {
            setIsLoading(true);
            const response = await api.post(`/uploads/${ticket.id}/report`, {
              report_system: null,
              report_summary: null,
              report_links: null,
              google_sheets_row_id: null,
            });
            if (response.status !== 200 && response.status !== 201) {
              throw new Error("Ошибка при удалении отчёта");
            }
            message.success("Отчёт удалён");
            window.location.reload();
          } catch (error) {
            console.error(error);
            message.error("Произошла ошибка при удалении отчёта.");
          } finally {
            setIsLoading(false);
          }
        },
      });
      return;
    }

    const reportData = {
      report_system: trimmedSystem === "" ? null : trimmedSystem,
      report_summary: trimmedSummary === "" ? null : trimmedSummary,
      report_links: trimmedLinks === "" ? null : trimmedLinks,
    };

    setIsLoading(true);
    try {
      const response = await api.post(`/uploads/${ticket.id}/report`, reportData);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Ошибка при сохранении отчёта");
      }
      message.success("Отчёт успешно сохранён!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      message.error("Произошла ошибка при сохранении отчёта.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ticket-details">
      <div className="ticket-header">
        <Title level={5}>Чат по заявке {formattedTicketId}</Title>
        <CloseOutlined className="close-button" onClick={handleClose} />
      </div>
      <Divider style={{ margin: "16px 0" }} />

      <div className="ticket-info">
        <Text type="secondary">ФИО</Text>
        <div>{ticket.contact_name || "Не указано"}</div>
      </div>
      <div className="ticket-info">
        <Text type="secondary">Бизнес-центр</Text>
        <div>{ticket.business_center?.name || "Не указано"}</div>
      </div>

      {/* Дата создания и статус в одной строке */}
      <div className="ticket-info date-status">
        <Text type="secondary">Дата создания</Text>
        <div className="date-status-content">
          <span>{new Date(ticket.created_at).toLocaleString("ru-RU")}</span>
          <span className="status-inline">
            {canEditStatus ? (
              <Select
                value={ticket.status}
                onChange={onStatusChangeHandler}
                style={{ marginLeft: 8, width: "160px" }}
              >
                {["Новая", "В работе", "На паузе", "Завершена"].map((status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            ) : (
              renderStatusTag(ticket.status)
            )}
          </span>
        </div>
      </div>

      {/* Горизонтальное выравнивание "Система" и "Вид работы" */}
      <div className="ticket-info system-work-row">
        <div className="system">
          <Text type="secondary">Система</Text>
          <div>{ticket.system || "Не указано"}</div>
        </div>
        <div className="work-type">
          <Text type="secondary">Вид работы</Text>
          <div>{ticket.work_type || "Не указано"}</div>
        </div>
      </div>

      <Divider />

      {/* Блок для выбора инженера (только для admin) */}
      {canEditEngineer && (
        <div className="ticket-info">
          <Text type="secondary">Инженер</Text>
          <Select
            value={ticket.assigned_engineer?.id ?? null}
            onChange={onEngineerChangeHandler}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="Назначить инженера"
          >
            <Option value={null}>Не назначен</Option>
            {engineers.map((engineer) => (
              <Option key={engineer.id} value={engineer.id}>
                {engineer.name}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {/* Блок "Отчёт" (отображается, если статус заявки "Завершена") */}
      {ticket.status === "Завершена" && (
        <>
          {isBusinessCenter ? (<div></div>) : (
            // Для остальных выводим разделительную линию
            <Divider />
          )}
          {hasReport ? (
            <>
              <div className="ticket-report-inline">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div className="report-section">
                      <Text strong>Неисправность:</Text>
                      <Text>{ticket.report_system}</Text>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="report-section">
                      <Text strong>Выполненные работы:</Text>
                      <Text>{ticket.report_summary}</Text>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="report-section">
                      <Text strong>
                        <LinkOutlined /> Фото / Видео:
                      </Text>
                      <Space direction="vertical">
                        {ticket.report_links
                          ?.split("\n")
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
                </Row>
              </div>
              {canShowReportBlock && (
                <Button
                  onClick={openModal}
                  icon={<FileTextOutlined />}
                  style={{ marginTop: "16px" }}
                >
                  Редактировать отчёт
                </Button>
              )}
            </>
          ) : (
            canShowReportBlock && (
              <Button type="primary" onClick={openModal}>
                Написать отчёт
              </Button>
            )
          )}
        </>
      )}

      {/* Модальное окно для создания/редактирования отчёта */}
      <Modal
        title={hasReport ? "Редактировать отчёт" : "Создать отчёт"}
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Неисправность"
            name="report_system"
            rules={[{ required: !hasReport, message: "Введите неисправность" }]}
          >
            <Input placeholder="Опишите неисправность или тип работ" />
          </Form.Item>
          <Form.Item
            label="Выполненные работы"
            name="report_summary"
            rules={[{ required: !hasReport, message: "Опишите выполненные работы/итог" }]}
          >
            <Input.TextArea rows={3} placeholder="Что было сделано" />
          </Form.Item>
          <Form.Item label="Ссылки на файлы/фото" name="report_links">
            <Input.TextArea
              rows={3}
              placeholder="http://example.com/image1.jpg&#10;http://example.com/docs.pdf"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TicketDetails;
