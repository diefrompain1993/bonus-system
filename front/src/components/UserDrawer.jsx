import React, { useEffect } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";

import { getBusinessCenters } from '../store/actions/businessCenterActions';
import { createUser, updateUser } from "../store/actions/userActions";

const { Option } = Select;

const UserDrawer = ({
  isEditMode,
  userData,
  onClose
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Достаем список БЦ из Redux (businessCentersReducer)
  const { businessCenters, loading: bcLoading } = useSelector(
    (state) => state.businessCenters
  );

  // При монтировании (или обновлении) загружаем все БЦ, если нужно
  useEffect(() => {
    dispatch(getBusinessCenters());
  }, [dispatch]);

  // Если режим редактирования и есть данные пользователя — заполняем форму
  useEffect(() => {
    if (isEditMode && userData) {
      form.setFieldsValue({
        name: userData.name || null,
        login: userData.login || null,
        email: userData.email || null,
        phone_number: userData.phone_number || null,
        role: userData.role || null,
        job_post: userData.job_post || null,
        business_center_id: userData.business_center
          ? userData.business_center.id
          : undefined,
        // Пароль при редактировании можно оставить пустым,
        // если пользователь не хочет менять пароль
      });
    } else {
      form.resetFields();
    }
  }, [isEditMode, userData, form]);

  // Сабмит формы
  const handleFinish = async (values) => {
    if (values.email === "") {
      values.email = null;
    }
    try {
      if (isEditMode && userData) {
        // Редактирование
        await dispatch(updateUser(userData.id, values));
        message.success("Данные пользователя обновлены");
      } else {
        // Создание
        await dispatch(createUser(values));
        message.success("Пользователь создан");
      }
      onClose(); // закрываем Drawer
    } catch (err) {
      message.error(
        err?.detail || "Ошибка при сохранении данных пользователя"
      );
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
    >
      <Form.Item
        label="ФИО"
        name="name"
        rules={[
          {
            required: true,
            message: "Введите ФИО пользователя",
          },
        ]}
      >
        <Input placeholder="Иванов Иван Иванович" />
      </Form.Item>

      <Form.Item
        label="Логин"
        name="login"
        rules={[
          {
            required: true,
            message: "Введите логин",
          },
        ]}
      >
        <Input placeholder="ivanov" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            type: "email",
            message: "Неверный формат email",
          },
        ]}
      >
        <Input placeholder="example@mail.com" />
      </Form.Item>

      <Form.Item
        label="Номер телефона"
        name="phone_number"
      >
        <Input placeholder="+7 (XXX) XXX-XX-XX" />
      </Form.Item>

      <Form.Item
        label="Роль"
        name="role"
        rules={[
          {
            required: true,
            message: "Выберите роль",
          },
        ]}
      >
        <Select
          placeholder="Выберите роль"
          allowClear
        >
          <Option value="ADMIN">Админ</Option>
          <Option value="CENTRAL_OFFICE">Центральный офис</Option>
          <Option value="BUSINESS_CENTER">БЦ</Option>
          <Option value="ENGINEER">Инженер</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Должность"
        name="job_post"
      >
        <Input placeholder="Напишите должность" />
      </Form.Item>

      <Form.Item
        label="Бизнес-центр"
        name="business_center_id"
      >
        <Select
          placeholder={bcLoading ? "Загрузка..." : "Выберите БЦ"}
          allowClear
          loading={bcLoading}
        >
          {businessCenters.map((bc) => (
            <Option key={bc.id} value={bc.id}>
              {bc.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Поле пароля (опционально):
          - При создании пользователя обязательное (required).
          - При редактировании — если нужно сменить пароль, можно ввести. */}
      <Form.Item
        label="Пароль"
        name="password"
        hasFeedback
        rules={
          !isEditMode
            ? [
                {
                  required: true,
                  message: "Введите пароль",
                },
              ]
            : []
        }
      >
        <Input.Password placeholder="Любой пароль" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
        >
          {isEditMode
            ? "Сохранить изменения"
            : "Создать пользователя"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserDrawer;
