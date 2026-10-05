import React from 'react';
import {SITE_TITLE, siteSpecific} from "../../../services";
import { Col, Row } from 'reactstrap';
import { DismissibleCookieBanner } from './DismissibleBanner';
import { Trans, useTranslation } from "react-i18next";

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

const DowntimeWarningBannerBody = () => {
    const { t } = useTranslation();
    return <Row className="align-items-center">
        <Col xs={12} sm={siteSpecific(2, 1)} md={1}>
            <h3 className="d-flex align-items-center justify-content-center gap-2">
                <i className="icon icon-warning icon-sm icon-color-black" aria-hidden="true" />
                <span id="research-heading" className="d-inline-block d-sm-none">{t("common:banners.downtime.heading")}</span>
            </h3>
        </Col>
        <Col xs={12} sm={siteSpecific(10, 11)} md={11}>
            {t("common:banners.downtime.message", { siteTitle: SITE_TITLE })}
        </Col>
    </Row>;
};

export const DowntimeWarningBanner = () => {
    return <DismissibleCookieBanner
        cookieName={DOWNTIME_COOKIE}
        theme={siteSpecific("danger", "warning")}
        dismissText={<>
            <Trans
                i18nKey="common:banners.downtime.dismissButton"
                components={{
                    screenReaderText: <span className="visually-hidden" />,
                }}
            />
        </>}
        show={true}
    >
        <DowntimeWarningBannerBody />
    </DismissibleCookieBanner>;
};
