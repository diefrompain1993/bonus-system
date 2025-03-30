import React from "react";
import { Layout, Row, Col } from "antd";
import "./Footer.css"; // Подключаем стили

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer className="app-footer">
      <Row justify="center" className="app-footer__content">
        <Col className="app-footer__contact">
          <p>
            Почта: <a href="mailto:info@smk-gr.ru">info@smk-gr.ru</a>
          </p>
          <p>
            Телефон: <a href="tel:+74959975027">+7(495) 997-50-27</a>
          </p>
        </Col>
        <Col className="app-footer__info">
          <p>
            Строительно-монтажная организация <br /> ООО
            "Связьмонтажкомплектация"
          </p>
          <p>ИНН/КПП: 7733135241/772601001</p>
          <p>ОРГН: 1027739586577</p>
        </Col>
      </Row>
      <Row justify="center" className="app-footer__bottom">
        <Col>
          <p className="app-footer__copyright">
            Copyright © СМК - системы безопасности 2025. Все права защищены.
          </p>
          <p className="app-footer__disclaimer">
            Перепечатка материалов без согласования допустима при наличии{" "}
            <a href="#" className="dofollow-link">
              dofollow-ссылки
            </a>{" "}
            на страницу-источник.
          </p>
        </Col>
      </Row>
    </Footer>
  );
};

export default AppFooter;
