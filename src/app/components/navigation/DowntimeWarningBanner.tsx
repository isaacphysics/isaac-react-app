import React, { useState } from "react";
import { Alert, Button, Col, Container, Row } from "reactstrap";
import Cookies from "js-cookie";
import { SITE_SUBJECT_TITLE, SOCIAL_LINKS } from "../../services";

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

export const DowntimeWarningBanner = () => {
  const [noCookie, setCookie] = useState(() => {
    const currentCookieValue = Cookies.get(DOWNTIME_COOKIE);
    return currentCookieValue != "1";
  });

  function clickDismiss() {
    setCookie(false);
    Cookies.set(DOWNTIME_COOKIE, "1", { expires: 14 /* days*/ });
  }

  const inDateRange = new Date(1626854400000) <= new Date() && new Date() <= new Date(1627056000000);

  return inDateRange && noCookie ? (
    <div className="banner d-print-none" id="downtime-banner">
      <Alert color="danger" className="mb-0">
        <Container>
          <Row style={{ alignItems: "center" }}>
            <Col xs={12} md={9}>
              <span>
                Please note Isaac {SITE_SUBJECT_TITLE} will be unavailable for an hour at 5pm BST on Friday 23
                <sup>rd</sup> July for essential maintenance. You will need to log in again once the maintenance is
                complete.
                <br />
                <a href={SOCIAL_LINKS.twitter.href} target="_blank" rel="noopener noreferrer">
                  Check our Twitter feed
                </a>{" "}
                for any updates on the day.
              </span>
            </Col>
            <Col xs={12} md={3} className="text-center">
              <Button
                color="primary"
                outline
                className="mt-3 mb-2 d-block d-md-inline-block banner-button"
                onClick={clickDismiss}
              >
                Dismiss<span className="sr-only"> downtime notification</span>
              </Button>
            </Col>
          </Row>
        </Container>
      </Alert>
    </div>
  ) : null;
};
