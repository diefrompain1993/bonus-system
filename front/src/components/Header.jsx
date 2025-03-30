import React, { useEffect, useState } from "react";
import { Layout, Button, Modal, Typography, Card, Divider } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";

import { logout } from "../store/actions/authActions";
import { getUsersByBusinessCenter } from "../store/actions/userActions";

import "./Header.css"; // Подключаем стили

const { Header } = Layout;
const { Title, Text, Paragraph } = Typography;

/**
 * Функция для отображения модального окна с информацией о бизнес-центре.
 * Пользователи выводятся в виде карточек с разделением и улучшенной типографикой.
 */
const showBCInfo = ({ title, bcUsers, address }) => {
  Modal.info({
    className: "the-info-modal",
    title: title,
    content: (
      <div id="app-header-info">
        {address && (
          <div className="bc-info-section">
            <Title level={5}>Адрес:</Title>
            <Paragraph>{address}</Paragraph>
          </div>
        )}
        <Divider />
        <Title level={5}>Сотрудники:</Title>
        {bcUsers.length === 0 ? (
          <Text type="secondary">Нет данных по сотрудникам</Text>
        ) : (
          <div className="bc-users-list">
            {bcUsers.map((bcUser) => (
              <Card
                key={bcUser.id}
                size="small"
                className="bc-user-card"
                style={{ marginBottom: 10 }}
              >
                {bcUser.name && (
                  <p>
                    <Text strong>Имя: </Text>
                    <Text>{bcUser.name}</Text>
                  </p>
                )}
                {bcUser.phone_number && (
                  <p>
                    <Text strong>Телефон: </Text>
                    <Text>{bcUser.phone_number}</Text>
                  </p>
                )}
                {bcUser.email && (
                  <p>
                    <Text strong>Почта: </Text>
                    <Text>{bcUser.email}</Text>
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    ),
    onOk() {},
  });
};

const AppHeader = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Получаем текущего пользователя и список пользователей БЦ из Redux
  const { user } = useSelector((state) => state.auth);
  const { usersByBC } = useSelector((state) => state.users);

  // Локальное состояние для пользователей бизнес-центра
  const [bcUsers, setBcUsers] = useState([]);

  // При монтировании или изменении пользователя загружаем пользователей БЦ
  useEffect(() => {
    if (user && user.business_center && user.business_center.id) {
      dispatch(getUsersByBusinessCenter(user.business_center.id));
    }
  }, [dispatch, user]);

  // Обновляем локальное состояние, когда в Redux появляются пользователи БЦ
  useEffect(() => {
    if (usersByBC) {
      setBcUsers(usersByBC);
    }
  }, [usersByBC]);

  // Выход из аккаунта
  const handleLogout = () => {
    dispatch(logout());
  };

  // Хелпер для определения активной ссылки (подсветка)
  const isActive = (path) => location.pathname === path;

  return (
    <Header className="app-header">
      {/* Левая часть хедера: логотип и кнопки для админа */}
      <div className="app-header__left">
        <a href="/" className="app-header__logo-link">
          <img src="/logo.png" alt="Логотип" className="app-header__logo-img" />
        </a>
        <span className="app-header__responsible">
          {/* Здесь можно отобразить контакт ответственного, если нужно */}
        </span>

        {user?.role === "admin" && (
          <div className="app-header__left-btns">
            <Link to="/bc-panel">
              <Button type={isActive("/bc-panel") ? "primary" : "default"}>
                БЦ
              </Button>
            </Link>
            <Link to="/users-panel">
              <Button type={isActive("/users-panel") ? "primary" : "default"}>
                Пользователи
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Правая часть хедера: имя пользователя, инфо и кнопка выхода */}
      <div className="app-header__right">
        <span className="app-header__username">
          {user?.role !== "admin" && user?.role !== "central_office" && (

            <span
              className="app-header__info"
              title="Информация о БЦ"
              style={{ marginRight: 10 }}
              onClick={() =>
                showBCInfo({
                  title: user?.business_center?.name || "Бизнес-центр",
                  address: user?.business_center?.address,
                  bcUsers: bcUsers,
                })
              }
            >
              <InfoCircleOutlined style={{ fontSize: 16, color: "#1890ff" }} />
            </span>
          )}
          {user?.business_center
            ? `${user.business_center.name} • ${user.name}`
            : user?.name}
        </span>
        <Button
          type="text"
          icon={
            <img
              src="/logoutIcon.png"
              alt="Выйти"
              className="app-header__logout-icon"
            />
          }
          onClick={handleLogout}
        />
      </div>
    </Header>
  );
};

export default AppHeader;
