import React, { useEffect, useState } from 'react';
import {
  AutoComplete,
  Button,
  notification,
  Input,
} from 'antd';
import {
  SearchOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import api from '../utils/api';
import './BonusSystemPage.css';

const BonusSystemPage = () => {
  const [telegramId, setTelegramId] = useState('');
  const [userName, setUserName] = useState('');
  const [telegramNickname, setTelegramNickname] = useState('');
  const [selectedObject, setSelectedObject] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark';
  });
  const [iconKey, setIconKey] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmHiding, setConfirmHiding] = useState(false);

  const objectOptions = [
    { value: 'Объект 1' },
    { value: 'Объект 2' },
    { value: 'Объект 3' },
    { value: 'Объект 4' },
    { value: 'Объект 5' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTelegramId(params.get('user_id') || '123456');
    setUserName(params.get('user_name') || 'Иван Иванов');
    setTelegramNickname(params.get('user_nickname') || 'ivan_test');
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
    // Проверка на Telegram Mini App или TelegramBot
    const userAgent = navigator.userAgent;
    if (userAgent.includes("TelegramBot") || userAgent.includes("Telegram Mini App")) {
      document.body.classList.add('telegram-mini-app');
    }
  }, [darkMode]);

  const handleConfirmSubmit = async () => {
    if (!telegramId || !userName || !selectedObject) {
      notification.error({
        message: 'Ошибка',
        description: 'Заполните все поля.',
        className: 'custom-notification error',
      });
      return;
    }

    const allowedValues = objectOptions.map((opt) => opt.value);
    if (!allowedValues.includes(selectedObject)) {
      notification.error({
        message: 'Ошибка',
        description: `Объект "${selectedObject}" не найден в списке.`,
        className: 'custom-notification error',
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('bonus/attendance', {
        telegram_id: telegramId,
        name: userName,
        telegram_nickname: telegramNickname,
        selected_object: selectedObject,
      });

      const { status, message } = data;
      if (status === 'already_marked') {
        notification.warning({
          message: 'Внимание',
          description: message || 'Сегодня вы уже отметились на этом объекте.',
          className: 'custom-notification warning',
        });
      } else if (status === 'ok') {
        notification.success({
          message: 'Успешно',
          description: 'Вы успешно отметились!',
          className: 'custom-notification success',
        });
      } else {
        notification.error({
          message: 'Ошибка',
          description: 'Произошла ошибка при отметке.',
          className: 'custom-notification error',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Сетевая ошибка',
        description: 'Не удалось отправить данные.',
        className: 'custom-notification error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedObject) {
      notification.warning({
        message: 'Предупреждение',
        description: 'Пожалуйста, выберите объект!',
        className: 'custom-notification warning',
      });
      return;
    }
    setConfirmVisible(true);
  };

  const handleCancelConfirm = () => {
    setConfirmHiding(true);
    setTimeout(() => {
      setConfirmVisible(false);
      setConfirmHiding(false);
    }, 350);
  };

  return (
    <div className="bonus-system-page">
      <div className="bonus-card">
        <div className="logo-wrapper">
          <div className="logo">СМК</div>
          <div className="theme-toggle">
            <Button
              shape="circle"
              onClick={() => {
                setDarkMode((prev) => !prev);
                setIconKey((prev) => prev + 1);
              }}
            >
              <span className="theme-toggle-icon">
                {darkMode ? <SunOutlined /> : <MoonOutlined />}
              </span>
            </Button>
          </div>
        </div>

        <h4 className="title">Выберите сегодняшний объект</h4>

        <AutoComplete
          options={objectOptions}
          style={{ width: '100%', marginBottom: 16 }}
          value={selectedObject}
          onChange={(val) => setSelectedObject(val)}
          filterOption={(inputValue, option) =>
            option.value.toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          <Input
  onFocus={() => {
    setIsTyping(true);
    document.body.classList.add('keyboard-open');
  }}
  onBlur={() => {
    setIsTyping(false);
    document.body.classList.remove('keyboard-open');
  }}
  onChange={(e) => setSelectedObject(e.target.value)}
  size="large"
  className="bonus-input"
  placeholder="Введите название объекта"
  suffix={
    isTyping ? (
      <SearchOutlined style={{ color: '#aaa' }} />
    ) : (
      <DownOutlined style={{ color: '#aaa' }} />
    )
  }
  autoComplete="new-password"
  autoCorrect="off"
  spellCheck={false}
/>
        </AutoComplete>

        <Button
          type="primary"
          className="submit-button"
          loading={loading}
          onClick={handleSubmit}
          disabled={loading}
          size="large"
        >
          {loading ? 'Отправка...' : 'Отметиться'}
        </Button>
      </div>

      {confirmVisible && (
        <div className={`custom-confirm-overlay ${confirmHiding ? 'hide' : ''}`}>
          <div className={`custom-confirm-card ${confirmHiding ? 'hide' : ''}`}>
            <div className="custom-confirm-icon">
              <ExclamationCircleOutlined />
            </div>
            <div className="custom-confirm-content">
              <h3>Подтвердите выбор</h3>
              <p>Вы уверены, что хотите выбрать "{selectedObject}"?</p>
            </div>
            <div className="custom-confirm-actions">
              <button className="cancel-btn" onClick={handleCancelConfirm}>
                Нет
              </button>
              <button
                className="confirm-btn"
                onClick={() => {
                  handleConfirmSubmit();
                  setConfirmVisible(false);
                }}
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusSystemPage;
