import React, {useState} from 'react';
import {Alert, Button, Col, Container, Row} from 'reactstrap';
import Cookies from 'js-cookie';
import {isAda, SITE_TITLE, siteSpecific} from "../../services";

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

export const DowntimeWarningBanner = () => {
    const [noCookie, setCookie] = useState(() => {
        const currentCookieValue = Cookies.get(DOWNTIME_COOKIE);
        return currentCookieValue != "1";
    });

    function clickDismiss() {
        setCookie(false);
        Cookies.set(DOWNTIME_COOKIE, "1", {expires: 14 /* days*/});
    }

    const inDateRange = new Date(1723114800000) <= new Date() && new Date() <= new Date(1723327200000);
    const colour = siteSpecific("danger", "warning"); // Ada doesn't support "danger" colours!

    return inDateRange && noCookie ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color={colour} className="mb-0">
            <Container>
                <Row style={{alignItems: "center"}}>
                    <Col xs={12} md={9}>
                        {SITE_TITLE} will be unavailable on Saturday 10 August from 8pm BST until early Sunday morning for essential server maintenance.
                    </Col>
                    <Col xs={12} md={3} className="text-center">
                        <Button color="keyline" className="my-2 my-md-0 d-block d-md-inline-block banner-button" onClick={clickDismiss}>
                            Dismiss<span className="visually-hidden"> downtime notification</span>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </Alert>
    </div>: null;
};
