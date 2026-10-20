import React from 'react';
import {isAda, SITE_TITLE, siteSpecific} from "../../../services";
import { Col, Row } from 'reactstrap';
import { DismissibleCookieBanner } from './DismissibleBanner';

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

const DowntimeWarningBannerBody = () => {
    return <Row className="align-items-center">
        <Col xs={12} sm={siteSpecific(2, 1)} md={1}>
            <div className="d-flex align-items-center justify-content-center gap-2">
                <i className="icon icon-warning icon-sm icon-color-black" aria-hidden="true" />
                <span id="research-heading" className="d-inline-block d-sm-none h3">&nbsp;Research</span>
            </div>
        </Col>
        <Col xs={12} sm={siteSpecific(10, 11)} md={11}>
            {SITE_TITLE} will be unavailable on Saturday 24 October from 8pm BST for a few hours for essential server maintenance.
        </Col>
    </Row>;
};

export const DowntimeWarningBanner = () => {
    return !!isAda && <DismissibleCookieBanner
        cookieName={DOWNTIME_COOKIE}
        theme={siteSpecific("danger", "warning")}
        dismissText={<>
            Dismiss
            <span className="visually-hidden"> downtime notification</span>
        </>}
        show={true}
    >
        <DowntimeWarningBannerBody />
    </DismissibleCookieBanner>;
};
