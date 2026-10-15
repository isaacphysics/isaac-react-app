import React, { useEffect } from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE, trackEvent} from "../../services";
import {useSessionExpired} from "../../services";
import { useTranslation } from "react-i18next";

export const SessionCookieExpired = () => {
    const { t } = useTranslation();

    const [target, clearRenewPath] = useSessionExpired();

    useEffect(() => {
        trackEvent("exception", { props: { description: `cookie_expired`, fatal: true } });
    }, []);

    return <Container>
        <TitleAndBreadcrumb breadcrumbTitleOverride={t("common:auth.sessionExpired.breadcrumb")} currentPageTitle={t("common:auth.sessionExpired.title")} icon={{type: "icon", icon: "icon-error"}} className="mb-4" />
        <p className="pb-2">{t("common:auth.sessionExpired.message", { siteTitle: SITE_TITLE })}</p>
        <Button color="solid" onClick={clearRenewPath} href={target}>{t("common:button.continue")}</Button>
    </Container>;
};
