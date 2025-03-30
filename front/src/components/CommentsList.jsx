// src/components/CommentsList.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { List, Button, Modal } from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  FileOutlined,
} from "@ant-design/icons";
import Fancybox from "./Fancybox";
import "./CommentsList.css";

const formatDateOnly = (dateString) => {
  if (!dateString) return "Неизвестная дата";
  const date = new Date(dateString);
  if (isNaN(date)) return "Неверная дата";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatTimeOnly = (dateString) => {
  if (!dateString) return "Неизвестное время";
  const date = new Date(dateString);
  if (isNaN(date)) return "Неверное время";
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const CommentsList = ({
  ticket,
  comments,
  onDelete,
  user,
  getProxyImageUrl,
  getProxyFileUrl,
  commentsContainerRef,
}) => {
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});
  const [floatingDate, setFloatingDate] = useState("");
  const [showFloatingDate, setShowFloatingDate] = useState(false);

  const scrollTimeoutRef = useRef(null);
  const prevCommentsLengthRef = useRef(comments.length);

  const isTicketCompleted = ticket?.status === "Завершена";

  // Сортируем комментарии по времени (по возрастанию)
  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      ),
    [comments]
  );

  // Вставляем date-separator
  const messagesWithDate = useMemo(() => {
    const result = [];
    let lastDate = null;

    for (const msg of sortedComments) {
      const msgDate = new Date(msg.timestamp).toDateString();
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        result.push({ type: "date", date: formatDateOnly(msg.timestamp) });
      }
      result.push({ type: "message", data: msg });
    }
    return result;
  }, [sortedComments]);

  // Автоскролл вниз при добавлении комментария
  useEffect(() => {
    const prevLength = prevCommentsLengthRef.current;
    const currentLength = sortedComments.length;
    if (currentLength > prevLength) {
      scrollToBottom();
    }
    prevCommentsLengthRef.current = currentLength;
  }, [sortedComments]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  };

  // Инициализируем "loading" для картинок, чтобы показывать плейсхолдер
  useEffect(() => {
    for (const comment of sortedComments) {
      if (comment.images) {
        for (const image of comment.images) {
          if (!(image.id in loadingImages)) {
            setLoadingImages((prev) => ({ ...prev, [image.id]: true }));
          }
        }
      }
    }
  }, [sortedComments, loadingImages]);

  // Плавающая дата при скролле
  const handleScroll = () => {
    setShowFloatingDate(true);
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setShowFloatingDate(false);
    }, 700);

    if (!commentsContainerRef.current) return;
    const container = commentsContainerRef.current;
    const containerTop = container.getBoundingClientRect().top;
    const dateSeparators = container.querySelectorAll(".date-separator");
    let currentDateText = null;

    for (let i = 0; i < dateSeparators.length; i++) {
      const sep = dateSeparators[i];
      const rect = sep.getBoundingClientRect();
      if (rect.top - containerTop < 60) {
        currentDateText = sep.textContent;
      } else {
        break;
      }
    }
    if (currentDateText) {
      setFloatingDate(currentDateText);
    }
  };

  useEffect(() => {
    if (!commentsContainerRef.current) return;
    const container = commentsContainerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Когда картинка загрузилась
  const handleImageLoad = (imageId) => {
    setLoadingImages((prev) => ({ ...prev, [imageId]: false }));
  };

  // Удаление комментария
  const showDeleteConfirm = (commentId) => {
    Modal.confirm({
      title: "Вы уверены, что хотите удалить комментарий?",
      icon: <ExclamationCircleOutlined />,
      okText: "Да",
      cancelText: "Нет",
      centered: true,
      onOk: () => onDelete(commentId),
    });
  };

  // Получить имя автора
  const getAuthorName = (comment) => {
    // Если это первое сообщение (id === "description"), то показываем "Описание"
    if (comment.id === "description") {
      return "Описание";
    }

    // Если автор не указан (например, гостевой комментарий)
    if (!comment.author) {
      return ticket.contact_name;
    } else if (comment.author.name === "admin") {
      return "СМК";
    } else {
      return comment.author.name || "Неизвестный пользователь";
    }
  };

  return (
    <Fancybox className="comments-list-wrapper">
      {/* Плавающая дата */}
      {floatingDate && (
        <div className={`floating-date ${showFloatingDate ? "visible" : ""}`}>
          {floatingDate}
        </div>
      )}

      <div ref={commentsContainerRef} className="comments-list-container">
        <List
          dataSource={messagesWithDate}
          locale={{ emptyText: "Нет комментариев" }}
          split={false}
          bordered={false}
          style={{ width: "100%", overflow: "visible" }}
          renderItem={(item, index) => {
            if (item.type === "date") {
              return (
                <List.Item key={`date-${index}`} className="date-separator">
                  <span>{item.date}</span>
                </List.Item>
              );
            }

            const comment = item.data;
            const isCurrentUser =
              comment.author && comment.author.id === user.id;
            // const isCurrentUser =
            //   comment.author && comment.author.role == "admin";
            const commentClass = isCurrentUser
              ? "comment-item right"
              : "comment-item left";

            const commentAuthorAdmin =
              comment.author && comment.author.role.toLowerCase() === "admin";

            const additionalClass = commentAuthorAdmin
              ? "msg-admin"
              : "msg-user";

            const hasText = Boolean(comment.text?.trim());
            const hasImages = comment.images && comment.images.length > 0;
            const hasFiles = comment.files && comment.files.length > 0;

            return (
              <List.Item
                key={comment.id}
                className={[commentClass, additionalClass]}
                onMouseEnter={() => setHoveredCommentId(comment.id)}
                onMouseLeave={() => setHoveredCommentId(null)}
              >
                <div className="comment-wrapper">
                  {/* Имя автора над пузырём */}
                  <span className="author-name">{getAuthorName(comment)}</span>

                  <div className="comment-bubble">
                    {/* Кнопка удаления для админа (и для инженера, если разрешено) */}
                    {user.role === "admin" &&
                      comment.id !== "description" &&
                      hoveredCommentId === comment.id && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteConfirm(comment.id)}
                          className="delete-icon-button-left"
                          aria-label="Удалить комментарий"
                        />
                      )}

                    <div className="comment-content">
                      {/* Блок с картинками */}
                      {hasImages && (
                        <div
                          className={`comment-images images-count-${comment.images.length}`}
                        >
                          {comment.images.map((image) => {
                            const isLoading = loadingImages[image.id];
                            return (
                              <div
                                key={image.id}
                                className="image-wrapper"
                                data-fancybox="gallery"
                                data-src={getProxyImageUrl(image.url)}
                              >
                                {isLoading && (
                                  <div className="image-placeholder">
                                    <div className="loading-animation" />
                                  </div>
                                )}
                                <img
                                  src={getProxyImageUrl(image.url)}
                                  alt="Фото"
                                  className={`comment-image ${
                                    isLoading ? "hidden" : "loaded"
                                  }`}
                                  onLoad={() => handleImageLoad(image.id)}
                                  loading="lazy"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Блок с файлами (любые типы) */}
                      {hasFiles && (
                        <div className="comment-files">
                          {comment.files.map((file) => (
                            <div key={file.id} className="file-wrapper">
                              <a
                                href={getProxyFileUrl(file.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="file-link"
                              >
                                <FileOutlined style={{ marginRight: 8 }} />
                                <span className="file-name">
                                  {file.filename ? file.filename : "Файл"}
                                </span>
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Текст комментария */}
                      {hasText && (
                        <div className="text-and-time">
                          <span className="comment-text">{comment.text}</span>
                          {/* <span className="message-time">{formatTimeOnly(comment.timestamp)}</span> */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />

        {isTicketCompleted && (
          <div className="ticket-completed-message">
            <CheckCircleOutlined
              style={{
                color: "#52c41a",
                fontSize: "24px",
                marginRight: "12px",
              }}
            />
            <span className="ticket-completed-text">
              Заявка завершена. При необходимости составьте новую заявку.
            </span>
          </div>
        )}
      </div>
    </Fancybox>
  );
};

export default CommentsList;
