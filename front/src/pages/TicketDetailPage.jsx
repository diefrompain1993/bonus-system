// src/pages/TicketDetailPage.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getTicketById,
  addCommentToTicket,
  deleteComment,
  updateTicketStatus,
  assignEngineer,
} from "../store/actions/ticketActions";
import { getEngineers } from "../store/actions/userActions";
import { Layout, Row, Col, Spin, message } from "antd";
import AppHeader from "../components/Header";
import CommentsList from "../components/CommentsList";
import AddCommentForm from "../components/AddCommentForm";
import TicketDetails from "../components/TicketDetails";
import "./TicketDetailPage.css";

const { Content } = Layout;

// Функция для формирования прокси-URL картинки (как у вас сейчас)
const getProxyImageUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const fileId = urlObj.searchParams.get("id");
    if (fileId) {
      return `https://sibeeria.ru/api/proxy-image/${fileId}`;
    }
    return url;
  } catch (error) {
    return url;
  }
};

// (Опционально) Функция для формирования прокси-URL файла —
// если хотите ту же логику для файлов, иначе можно возвращать url как есть.
const getProxyFileUrl = (url) => {
  return url;
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const ticket = useSelector((state) => state.tickets.ticket);
  const { user } = useSelector((state) => state.auth);
  const engineers = useSelector((state) => state.users.engineers);

  const [commentText, setCommentText] = useState("");
  const [imageList, setImageList] = useState([]); // <-- отдельный список для "изображений"
  const [docList, setDocList] = useState([]);     // <-- отдельный список для "файлов"
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTicketCompleted = ticket?.status === "Завершена";
  const commentsContainerRef = useRef(null);

  // Загружаем тикет
  const fetchTicket = useCallback(async () => {
    try {
      await dispatch(getTicketById(id));
    } catch {
      message.error("Не удалось загрузить заявку");
    } finally {
      setLoading(false);
    }
  }, [dispatch, id]);

  useEffect(() => {
    fetchTicket();
    dispatch(getEngineers());
  }, [fetchTicket, dispatch]);

  // Добавление комментария
  const handleAddComment = useCallback(
    async () => {
      // Если нет ни текста, ни файлов, ни изображений
      if (!commentText.trim() && imageList.length === 0 && docList.length === 0) {
        message.warning("Введите текст комментария или добавьте изображение/файл.");
        return;
      }

      setIsSubmitting(true);

      // Формируем FormData
      const formData = new FormData();
      formData.append("text", commentText.trim());

      // 1) Добавляем картинки
      imageList.forEach((file) => {
        formData.append("images", file.originFileObj);
      });

      // 2) Добавляем файлы
      docList.forEach((file) => {
        formData.append("files", file.originFileObj);
      });

      try {
        await dispatch(addCommentToTicket(id, formData));
        message.success("Комментарий добавлен");
        setCommentText("");
        setImageList([]);
        setDocList([]);

        // Обновляем тикет
        fetchTicket();

        // Скроллим вниз
        if (commentsContainerRef.current) {
          commentsContainerRef.current.scrollTop =
            commentsContainerRef.current.scrollHeight;
        }
      } catch {
        message.error("Не удалось добавить комментарий");
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, id, commentText, imageList, docList, fetchTicket]
  );

  // Удаление комментария
  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        await dispatch(deleteComment(commentId));
        message.success("Комментарий удален");
        fetchTicket();
      } catch {
        message.error("Не удалось удалить комментарий");
      }
    },
    [dispatch, fetchTicket]
  );

  // Обновление статуса
  const handleStatusChange = useCallback(
    async (value) => {
      try {
        await dispatch(updateTicketStatus(id, value));
        message.success("Статус заявки обновлен");
        fetchTicket();
      } catch {
        message.error("Ошибка при обновлении статуса");
      }
    },
    [dispatch, id, fetchTicket]
  );

  // Назначить инженера
  const handleEngineerChange = useCallback(
    async (engineerId) => {
      try {
        await dispatch(assignEngineer(id, engineerId));
        message.success("Инженер назначен");
        fetchTicket();
      } catch {
        message.error("Ошибка при назначении инженера");
      }
    },
    [dispatch, id, fetchTicket]
  );

  if (loading) {
    return <Spin tip="Загрузка..." className="loading-spinner" />;
  }

  if (!ticket) {
    return <p>Заявка не найдена</p>;
  }

  // Формируем "id" тикета для чего-то (у вас в коде так)
  const formattedTicketId = `${new Date(ticket.created_at).getTime()}-${ticket.id}`;

  // Создаём "искусственный" первый комментарий с описанием заявки
  const commentsWithDescription = [
    {
      id: "description",
      text: ticket.description,
      timestamp: ticket.created_at,
    },
    ...(ticket.comments || []),
  ];

  return (
    <Layout className="ticket-detail-layout">
      <AppHeader />
      <Content className="ticket-detail-content">
        <Row gutter={[24, 24]}>
          <Col
            xs={24}
            lg={16}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <CommentsList
              ticket={ticket}
              comments={commentsWithDescription}
              onDelete={handleDeleteComment}
              user={user}
              getProxyImageUrl={getProxyImageUrl}
              getProxyFileUrl={getProxyFileUrl}
              commentsContainerRef={commentsContainerRef}
            />
            <AddCommentForm
              commentText={commentText}
              setCommentText={setCommentText}
              imageList={imageList}
              setImageList={setImageList}
              docList={docList}
              setDocList={setDocList}
              handleAddComment={handleAddComment}
              isSubmitting={isSubmitting}
              isTicketCompleted={isTicketCompleted}
            />
          </Col>
          <Col xs={24} lg={8}>
            <TicketDetails
              ticket={ticket}
              formattedTicketId={formattedTicketId}
              handleStatusChange={handleStatusChange}
              handleEngineerChange={handleEngineerChange}
              engineers={engineers}
              user={user}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default TicketDetailPage;
