import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";

// Экшены для создания/обновления БЦ
import {
  createBusinessCenter,
  updateBusinessCenter,
} from "../store/actions/businessCenterActions";

const BcPanelDrawer = ({ onClose, editingBc }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Если в store вы храните состояние загрузки и ошибок:
  const { createLoading, updateLoading, error } = useSelector(
    (state) => state.businessCenters
  );

  // При монтировании, если есть editingBc, заполняем поля для редактирования
  useEffect(() => {
    if (editingBc) {
      form.setFieldsValue({
        name: editingBc.name,
        address: editingBc.address,
      });
    } else {
      form.resetFields();
    }
  }, [editingBc, form]);

  // При ошибке
  useEffect(() => {
    if (error) {
      message.error(error.detail || "Ошибка при сохранении БЦ");
    }
  }, [error]);

  // Сабмит формы
  const onFinish = async (values) => {
    try {
      if (editingBc) {
        // Редактирование
        await dispatch(updateBusinessCenter(editingBc.id, values));
        message.success("БЦ успешно обновлён");
      } else {
        // Создание
        await dispatch(createBusinessCenter(values));
        message.success("БЦ успешно создан");
      }
      onClose();
      form.resetFields();
    } catch (err) {
      message.error("Ошибка при сохранении БЦ");
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label="Название"
        rules={[{ required: true, message: "Введите название БЦ" }]}
      >
        <Input placeholder="Например, БЦ «Омега-Плаза»" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Адрес"
      >
        <Input placeholder="Ул. Примерная, д. 1" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={editingBc ? updateLoading : createLoading}
          block
        >
          {editingBc ? "Сохранить изменения" : "Создать БЦ"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BcPanelDrawer;
