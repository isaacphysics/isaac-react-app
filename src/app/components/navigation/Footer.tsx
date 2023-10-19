import React from "react";
import { Container, Col, Row } from "reactstrap";
import { ListGroupFooter } from "../elements/list-groups/ListGroupFooter";
import { ListGroupSocial } from "../elements/list-groups/ListGroupSocial";
import { ListGroupFooterBottom } from "../elements/list-groups/ListGroupFooterBottom";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer>
    <div className="footerTop d-print-none">
      <Container>
        <Row className="px-3 px-sm-0 pb-3 pb-md-4">
          <Col md="4" lg="3" className="pt-5 logo-col">
            <div className="d-flex flex-row">
              <Link to="/">
                <img src="/assets/logo-mustard.svg" className="footerLogo" alt="Isaac Computer Science homepage" />
              </Link>
            </div>
            <div className="footer-links logo-text pt-3">
              <p>
                Isaac Computer Science is part of the
                <Link to="/teachcomputing">National Centre for Computing Education.</Link>
              </p>
            </div>
          </Col>
          <Col md={{ size: 7, offset: 1 }} lg={{ size: 5, offset: 1 }} className="pt-5 mt-4 mt-md-0">
            <ListGroupFooter />
          </Col>
          <Col md="5" lg="3" className="pt-5 mt-4 mt-lg-0">
            <ListGroupSocial />
          </Col>
        </Row>
      </Container>
    </div>
    <div className="footerBottom">
      <Container>
        <Row className="pt-3 px-3 px-sm-0 pb-3">
          <ListGroupFooterBottom />
        </Row>
      </Container>
    </div>
  </footer>
);
