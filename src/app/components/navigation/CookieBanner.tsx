import React, { useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { logAction, useAppDispatch } from "../../state";
import { Button, Col, Container, Row } from "reactstrap";

const COOKIE_COOKIE = "isaacCookiesAccepted";

export const CookieBanner = () => {
  const dispatch = useAppDispatch();
  const [show, setShown] = useState(() => {
    const currentCookieValue = Cookies.get(COOKIE_COOKIE);
    return currentCookieValue != "1";
  });

  function clickDismiss() {
    setShown(false);
    Cookies.set(COOKIE_COOKIE, "1", { expires: 720 /* days*/ });
    const eventDetails = { type: "ACCEPT_COOKIES" };
    dispatch(logAction(eventDetails));
  }

  return show ? (
    <div className="banner d-print-none" id="cookie-banner">
      <Container className="py-3">
        <Row style={{ alignItems: "center" }}>
          <Col xs={12} sm={2} md={1}>
            <h3 className="text-center">
              <span role="presentation" aria-labelledby="cookies-heading">
                ℹ
              </span>
              <span id="cookies-heading" className="d-inline-block d-sm-none">
                &nbsp;Cookies
              </span>
            </h3>
          </Col>
          <Col xs={12} sm={10} md={8}>
            <small>
              We use cookies to ensure you get the best experience on our website.
              <br />
              View our <Link to="/privacy">privacy policy</Link> and <Link to="/cookies">cookie policy</Link> for
              details.
            </small>
          </Col>
          <Col xs={12} md={3} className="text-center">
            <Button
              color="primary"
              outline
              className="mt-3 mb-2 d-block d-md-inline-block banner-button"
              onClick={clickDismiss}
            >
              Accept
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  ) : null;
};
