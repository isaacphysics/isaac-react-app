import React from 'react';
import {isAda, SITE_TITLE, siteSpecific} from "../../../services";
import { Col, Row } from 'reactstrap';
import { DismissibleCookieBanner } from './DismissibleBanner';
import { Trans, useTranslation } from "react-i18next";

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

const DowntimeWarningBannerBody = () => {
    const { t } = useTranslation();
    return <Row className="align-items-center">
        <Col xs={12}>
            {t("common:banners.downtime.message", { siteTitle: SITE_TITLE })}
        </Col>
    </Row>;
};

export const DowntimeWarningBanner = () => {
    return !!isAda && <DismissibleCookieBanner
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
