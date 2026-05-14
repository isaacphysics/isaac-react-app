import React, { useEffect } from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE, trackEvent} from "../../services";
import {useSessionExpired} from "../../services";
import { useTranslation } from 'react-i18next'

export const SessionCookieExpired = () => {
    const { t } = useTranslation()

    const [target, clearRenewPath] = useSessionExpired();

    useEffect(() => {
        trackEvent("exception", { props: { description: `cookie_expired`, fatal: true } });
    }, []);

    return <Container>
        <TitleAndBreadcrumb breadcrumbTitleOverride="Session expired" currentPageTitle="Your session has expired" icon={{type: "icon", icon: "icon-error"}} className="mb-4" />
        <p className="pb-2">{t('yourSite_titleSessionHasExpiredSoWeveLoggedYouOutUseTheButtonBelowToContinueWhereYouLeftOff', 'Your {{SITE_TITLE}} session has expired, so we\'ve logged you out. Use the button below to continue where you left off.', { SITE_TITLE })}</p>
        <Button color="solid" onClick={clearRenewPath} href={target}>{t('continue', 'Continue')}</Button>
    </Container>;
};
