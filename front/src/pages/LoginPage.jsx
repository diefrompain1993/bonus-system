// src/pages/LoginPage.jsx

import React from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin } from '../store/actions/authActions';
import { Navigate } from 'react-router-dom';
import './LoginPage.css';
// import logo from '/logo.png';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector(state => state.auth);

  const onFinish = values => {
    const { login, password } = values;
    dispatch(userLogin(login, password));
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Логотип */}
        <div className="login-logo">
          <img src={logo} alt="Логотип" style={{ maxWidth: '150px' }} />
        </div>

        {/* Заголовок */}
        <div className="login-title">Вход</div>

        {/* Ошибка авторизации */}
        {error && (
          <Alert
            message="Ошибка авторизации"
            description={error.detail}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        {/* Форма входа */}
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="login"
            label="Логин"
            rules={[{ required: true, message: 'Введите логин' }]}
          >
            <Input placeholder="Логин" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block className="login-button">
              Войти
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
