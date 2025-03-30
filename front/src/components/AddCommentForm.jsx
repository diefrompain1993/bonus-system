import React, { useRef } from "react";
import { Input, Button, Upload, message, Dropdown } from "antd";
import {
  PaperClipOutlined,
  FileImageOutlined,
  FileOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "./AddCommentForm.css";

const { TextArea } = Input;

const AddCommentForm = ({
  commentText,
  setCommentText,
  imageList,
  setImageList,
  docList,
  setDocList,
  handleAddComment,
  isSubmitting,
  isTicketCompleted = false,
}) => {
  const imageUploadRef = useRef(null);
  const fileUploadRef = useRef(null);

  // onChange для изображений
  const handleImageChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 10) {
      message.warning("Вы можете загрузить не более 10 изображений.");
      return;
    }
    setImageList(newFileList);
  };

  // onChange для файлов
  const handleFileChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 10) {
      message.warning("Вы можете загрузить не более 10 файлов.");
      return;
    }
    setDocList(newFileList);
  };

  // Удаление конкретного изображения из imageList
  const removeImage = (file) => {
    setImageList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  // Удаление конкретного файла из docList
  const removeDoc = (file) => {
    setDocList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  // Меню скрепки
  const menuItems = [
    {
      key: "image",
      label: "Прикрепить изображение",
      icon: <FileImageOutlined />,
      onClick: () => {
        if (imageUploadRef.current) {
          imageUploadRef.current.click();
        }
      },
    },
    {
      key: "file",
      label: "Прикрепить файл",
      icon: <FileOutlined />,
      onClick: () => {
        if (fileUploadRef.current) {
          fileUploadRef.current.click();
        }
      },
    },
  ];

  return (
    <div className="add-comment-form">
      <TextArea
        rows={3}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder={isTicketCompleted ? "Заявка завершена" : "Напишите комментарий..."}
        disabled={isTicketCompleted}
      />
      
      {/* Блок предварительного просмотра вложений */}
      <div className="attachments-preview">
        {/* Превью изображений */}
        {imageList.map((file) => {
          const url = URL.createObjectURL(file.originFileObj);
          return (
            <div key={file.uid} className="attachment-item image-attachment">
              <img src={url} alt="изображение" className="attachment-image" />
              <Button
                type="text"
                icon={<CloseCircleOutlined style={{ color: "#f5222d" }} />}
                onClick={() => removeImage(file)}
                className="remove-attachment-btn"
              />
            </div>
          );
        })}
        
        {/* Превью файлов */}
        {docList.map((file) => (
          <div key={file.uid} className="attachment-item file-attachment">
            <FileOutlined style={{ marginRight: 4 }} />
            <span className="file-name">{file.name}</span>
            <Button
              type="text"
              icon={<CloseCircleOutlined style={{ color: "#f5222d" }} />}
              onClick={() => removeDoc(file)}
              className="remove-attachment-btn"
            />
          </div>
        ))}
      </div>
      
      <div className="form-actions">
        <Button
          type="primary"
          onClick={handleAddComment}
          loading={isSubmitting}
          disabled={isTicketCompleted}
        >
          Отправить
        </Button>

        <Dropdown menu={{ items: menuItems }} trigger={["click"]} disabled={isTicketCompleted}>
          <Button icon={<PaperClipOutlined />} disabled={isTicketCompleted}>
            Прикрепить
          </Button>
        </Dropdown>

        {/* Скрытый Upload для изображений */}
        <Upload
          fileList={imageList}
          onChange={handleImageChange}
          beforeUpload={() => false}
          multiple
          showUploadList={false}
          accept="image/*"
          style={{ display: "none" }}
        >
          <button type="button" ref={imageUploadRef} style={{ display: "none" }} />
        </Upload>

        {/* Скрытый Upload для файлов */}
        <Upload
          fileList={docList}
          onChange={handleFileChange}
          beforeUpload={() => false}
          multiple
          showUploadList={false}
          style={{ display: "none" }}
        >
          <button type="button" ref={fileUploadRef} style={{ display: "none" }} />
        </Upload>
      </div>
    </div>
  );
};

export default AddCommentForm;
