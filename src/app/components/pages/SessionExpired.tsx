import React, { useEffect } from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {trackEvent, WEBMASTER_EMAIL} from "../../services";
import { useTranslation } from 'react-i18next'

export const SessionExpired = () => {
    const { t } = useTranslation()
    useEffect(() => {
        trackEvent("exception", { props: { description: `session_expired`, fatal: true } });
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Session expired error" currentPageTitle="Session expired" icon={{type: "icon", icon: "icon-error"}}/>

            <h3 className="my-4">{t('wereSorryButYourSessionHasExpired', 'We\'re sorry, but your session has expired!')}</h3>

            <p>
                {t('youShould', 'You should ')}
                <a
                    role="button"
                    tabIndex={0}
                    href={window.location.href}
                    onKeyPress={() => window.location.reload()}
                    onClick={() => window.location.reload()}
                >
                    {t('refreshThisPageAndTryAgain', 'refresh this page and try again')}
                </a>
                {t('orTryRefreshingWhilst', ', or try refreshing whilst ')}
                <a href="https://en.wikipedia.org/wiki/Wikipedia:Bypass_your_cache#Bypassing_cache" target="_blank" rel="noopener noreferrer">
                    {t('bypassingYourBrowsersCache', 'bypassing your browser\'s cache')}
                </a>
                {t('whichMayHaveSavedAnOutdatedVersionOfIsaac', ', which may have saved an outdated version of Isaac.')}
            </p>
            <p>
                {t('pleaseEmail', 'Please email ')}
                <a href={`mailto:${WEBMASTER_EMAIL}`}>{WEBMASTER_EMAIL}</a>
                {t('ifThisKeepsHappening', ' if this keeps happening.')}
            </p>
        </div>
    </Container>;
};
