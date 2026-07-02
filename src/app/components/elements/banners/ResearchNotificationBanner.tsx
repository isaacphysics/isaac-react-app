import React from 'react';
import {Link} from "react-router-dom";
import {logAction, useAppDispatch} from "../../../state";
import {isAda, siteSpecific} from "../../../services";
import { Row, Col } from 'reactstrap';
import { DismissibleCookieBanner } from './DismissibleBanner';

const RESEARCH_NOTIFICATION_COOKIE = "researchNotificationDismissed";

const ResearchNotificationBannerBody = () => {
    return <Row className="align-items-center" id="research-banner">
        <Col xs={12} sm={siteSpecific(2, 1)} md={1}>
            <h3 className="d-flex align-items-center justify-content-center gap-2">
                <i className="icon icon-info icon-sm icon-color-black" aria-hidden="true" />
                <span id="research-heading" className="d-inline-block d-sm-none">&nbsp;Research</span>
            </h3>
        </Col>
        <Col xs={12} sm={siteSpecific(10, 11)} md={11}>
            We record your use of this site and the information you enter to support research into
            online learning at the University of Cambridge{isAda ? " and the Raspberry Pi Foundation" : ""}.
            Full details are in the <Link to="/privacy">privacy policy</Link>.
        </Col>
    </Row>;
};

export const ResearchNotificationBanner = () => {
    const dispatch = useAppDispatch();

    return <DismissibleCookieBanner
        cookieName={RESEARCH_NOTIFICATION_COOKIE}
        theme="light"
        dismissText="Got it"
        onDismiss={() => dispatch(logAction({type: "RESEARCH_NOTIFICATION_DISMISSED"}))}
        show={true}
    >
        <ResearchNotificationBannerBody />
    </DismissibleCookieBanner>;
};
