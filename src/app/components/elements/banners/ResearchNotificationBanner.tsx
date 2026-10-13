import React from 'react';
import {Link} from "react-router-dom";
import {logAction, useAppDispatch} from "../../../state";
import {siteSpecific} from "../../../services";
import { Row, Col } from 'reactstrap';
import { DismissibleCookieBanner } from './DismissibleBanner';
import { Trans, useTranslation } from "react-i18next";

const RESEARCH_NOTIFICATION_COOKIE = "researchNotificationDismissed";

const ResearchNotificationBannerBody = () => {
    const { t } = useTranslation();
    return <Row className="align-items-center" id="research-banner">
        <Col xs={12} sm={siteSpecific(2, 1)} md={1}>
            <div className="d-flex align-items-center justify-content-center gap-2">
                <i className="icon icon-info icon-sm icon-color-black" aria-hidden="true" />
                <span id="research-heading" className="d-inline-block d-sm-none h3">{t("common:banners.research.heading")}</span>
            </div>
        </Col>
        <Col xs={12} sm={siteSpecific(10, 11)} md={11}>
            <Trans i18nKey="site:banners.research.body" components={{ privacyLink: <Link to="/privacy" /> }} />
        </Col>
    </Row>;
};

export const ResearchNotificationBanner = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    return <DismissibleCookieBanner
        cookieName={RESEARCH_NOTIFICATION_COOKIE}
        theme="light"
        dismissText={t("common:banners.research.dismissButton")}
        onDismiss={() => dispatch(logAction({type: "RESEARCH_NOTIFICATION_DISMISSED"}))}
        show={true}
        id="research-banner"
    >
        <ResearchNotificationBannerBody />
    </DismissibleCookieBanner>;
};
