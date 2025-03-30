// src/components/TicketDrawer.jsx
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createTicket } from '../store/actions/ticketActions';
import { getBusinessCenters } from '../store/actions/businessCenterActions';
import { getEngineers, getUsersByBusinessCenter } from '../store/actions/userActions';

const { Option } = Select;
const { TextArea } = Input;

const TicketDrawer = ({ onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { businessCenters, loading: bcLoading, error: bcError } = useSelector(state => state.businessCenters);
  const { engineers, loading: engineersLoading, usersByBC, error: usersByBCError } = useSelector(state => state.users);
  const { user } = useSelector(state => state.auth);
  const { createLoading, createError } = useSelector(state => state.tickets);

  const systems = ["СКУД (двери)", "СКУД (турникеты)", "Шлагбаум", "Видеонаблюдение", "Регламентное ТО"];

  // Локальное состояние для хранения пользователей выбранного бизнес-центра
  const [bcUsers, setBcUsers] = useState([]);

  // Инициализация данных при монтировании компонента
  useEffect(() => {
    // Для ролей admin и central_office загружаем все бизнес-центры
    if (user.role === 'admin' || user.role === 'central_office') {
      dispatch(getBusinessCenters());
    }

    // Для роли admin загружаем инженеров
    if (user.role === 'admin') {
      dispatch(getEngineers());
    }

    // Если пользователь относится к бизнес-центру, загружаем пользователей его бизнес-центра
    if (user.role === 'business_center' && user.business_center_id) {
      dispatch(getUsersByBusinessCenter(user.business_center_id));
    }
  }, [dispatch, user.role, user.business_center_id]);

  // Обновление локального состояния при получении пользователей бизнес-центра
  useEffect(() => {
    setBcUsers(usersByBC);
  }, [usersByBC]);

  // Обработка изменений в форме
  const handleFormChange = (changedValues, allValues) => {
    if (changedValues.business_center_id) {
      const selectedBCId = changedValues.business_center_id;
      dispatch(getUsersByBusinessCenter(selectedBCId));
      // Сброс значения ФИО при смене БЦ
      form.setFieldsValue({ contact_name: undefined });
    }
  };

  // Обработчик изменения бизнес-центра для администраторов и центрального офиса
  const handleBusinessCenterChange = (value) => {
    // Дополнительная логика при необходимости
  };

  // Обработка ошибок загрузки пользователей бизнес-центра
  useEffect(() => {
    if (usersByBCError) {
      message.error('Ошибка при загрузке пользователей бизнес-центра');
    }
  }, [usersByBCError]);

  // Обработка ошибок загрузки бизнес-центров
  useEffect(() => {
    if (bcError) {
      message.error('Ошибка при загрузке бизнес-центров');
    }
  }, [bcError]);

  // Обработка ошибок создания заявки
  useEffect(() => {
    if (createError) {
      message.error('Ошибка при создании заявки');
    }
  }, [createError]);

  // Обработка отправки формы
  const onFinish = values => {
    const ticketData = {
      ...values,
      business_center_id: user.role === 'business_center' ? user.business_center.id : values.business_center_id,
      contact_name: user.role === 'business_center' ? user.name : values.contact_name,
      // Добавьте другие необходимые поля, например, author_id, если требуется
    };

    dispatch(createTicket(ticketData))
      .then(() => {
        message.success('Заявка успешно создана');
        onClose();
        form.resetFields();
      })
      .catch(() => {
        message.error('Ошибка при создании заявки');
      });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onValuesChange={handleFormChange}
    >
      <Row gutter={[16, 16]}>
        {/* Выбор Бизнес-центра только для admin и central_office */}
        {(user.role === 'admin' || user.role === 'central_office') && (
          <Col xs={24}>
            <Form.Item
              name="business_center_id"
              label="Бизнес центр"
              rules={[{ required: true, message: 'Выберите бизнес центр' }]}
            >
              <Select
                placeholder="Выберите БЦ"
                loading={bcLoading}
                onChange={handleBusinessCenterChange}
              >
                {businessCenters.filter(bc => !bc.archived)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(bc => (
                  <Option key={bc.id} value={bc.id}>{bc.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}

        {/* Автоматическая установка business_center_id для business_center пользователей */}
        {user.role === 'business_center' && (
          <Form.Item name="business_center_id" initialValue={user.business_center.id} hidden>
            <Input type="hidden" />
          </Form.Item>
        )}

        {/* Выбор ФИО только для admin и central_office */}
        {(user.role === 'admin' || user.role === 'central_office') && bcUsers.length > 0 && (
          <Col xs={24}>
            <Form.Item
              name="contact_name"
              label="ФИО"
              rules={[{ required: true, message: 'Выберите ФИО обращающегося' }]}
            >
              <Select
                placeholder="Выберите ФИО"
                loading={usersByBC.length === 0 && !usersByBCError}
              >
                {bcUsers.filter(users => !users.archived).map(bcUser => (
                  <Option key={bcUser.id} value={bcUser.name}>{bcUser.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}

        {/* Выбор системы */}
        <Col xs={24}>
          <Form.Item
            name="system"
            label="Система"
            rules={[{ required: true, message: 'Выберите систему' }]}
          >
            <Select placeholder="Выберите систему">
              {systems.map(system => (
                <Option key={system} value={system}>{system}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Выбор вида работы */}
        <Col xs={24}>
          <Form.Item
            name="work_type"
            label="Вид работы"
            rules={[{ required: true, message: 'Укажите вид работы' }]}
          >
            <Select placeholder="Выберите вид работы">
              <Option value="Обычная">Обычная</Option>
              <Option value="Аварийная">Аварийная</Option>
              <Option value="Доп. работы">Доп. работы</Option>
              <Option value="Тех. обслуживание">Тех. обслуживание</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Выбор инженера (только для администраторов) */}
        {user.role === 'admin' && (
          <Col xs={24}>
            <Form.Item
              name="engineer_id"
              label="Инженер"
              rules={[{ required: false, message: 'Выберите инженера' }]}
            >
              <Select
                placeholder="Выберите инженера"
                loading={engineersLoading}
                disabled={engineersLoading}
              >
                {engineers.map(engineer => (
                  <Option key={engineer.id} value={engineer.id}>{engineer.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}

        {/* Описание проблемы */}
        <Col xs={24}>
          <Form.Item
            name="description"
            label="Описание проблемы"
            rules={[{ required: true, message: 'Опишите проблему' }]}
          >
            <TextArea rows={4} placeholder="Опишите проблему" />
          </Form.Item>
        </Col>

        {/* Кнопка отправки заявки */}
        <Col xs={24}>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={createLoading}>
              Отправить заявку
            </Button>
          </Form.Item>
        </Col>
      </Row>

      {/* Обработка ошибок */}
      {bcError && message.error('Ошибка при загрузке бизнес-центров')}
      {createError && message.error('Ошибка при создании заявки')}
    </Form>
  );
};

export default TicketDrawer;
