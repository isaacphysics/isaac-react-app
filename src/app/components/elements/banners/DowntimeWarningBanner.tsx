import React from 'react';
import {SITE_TITLE, siteSpecific} from "../../../services";
import { DismissibleCookieBannerProps } from '../../../services/siteBanners';
import { Col, Row } from 'reactstrap';

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

const DowntimeWarningBannerBody = () => {
    return <Row className="align-items-center">
        <Col xs={12} sm={siteSpecific(2, 1)} md={1}>
            <h3 className="d-flex align-items-center justify-content-center gap-2">
                <i className="icon icon-warning icon-sm icon-color-black" aria-hidden="true" />
                <span id="research-heading" className="d-inline-block d-sm-none">&nbsp;Research</span>
            </h3>
        </Col>
        <Col xs={12} sm={siteSpecific(10, 11)} md={11}>
            {SITE_TITLE} may be unavailable on Tuesday 15 July from 7am BST until 9am BST due to essential network maintenance.
        </Col>
    </Row>;
};

export const useDowntimeWarningBanner = () : DismissibleCookieBannerProps => {
    return {
        type: "dismissibleCookieBanner",
        cookieName: DOWNTIME_COOKIE,
        theme: siteSpecific("danger", "warning"),
        dismissText: <>Dismiss<span className="visually-hidden"> downtime notification</span></>,
        children: <DowntimeWarningBannerBody />,
        show: true,
    };
};
