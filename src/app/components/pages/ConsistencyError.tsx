import {SITE_TITLE} from "../../services";
import React from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useSessionExpired} from "../../services";
import { useTranslation } from 'react-i18next'

export const ConsistencyError = () => {
    const { t } = useTranslation()

    const [target, clearRenewPath] = useSessionExpired();

    return <Container>
        <TitleAndBreadcrumb breadcrumbTitleOverride="User consistency error" currentPageTitle={t('yourSite_titleSessionHasChanged', 'Your {{SITE_TITLE}} session has changed', { SITE_TITLE })} icon={{type: "icon", icon: "icon-error"}} className="mb-4" />
        <p className="pb-2">{t('youHaveLoggedOutInAnotherTabOrBrowserWindowSoWe39veLoggedYouOutHereUseTheButtonBelowToContinueWhereYouLeftOff', 'You have logged out in another tab or browser window, so we&#39;ve logged you out here. Use the button below to continue where you left off.')}</p>
        <p>
            <b>{t('tip', 'Tip:')}</b>
            {t('ifYouWantToBeLoggedInToTwoAccountsAtTheSameTimeYouCanUseYourBrowsers', ' If you want to be logged in to two accounts at the same time, you can use your browser\'s ')}
            <a href="https://en.wikipedia.org/wiki/Privacy_mode" target="_blank" rel="noopener noreferrer">
                {t('privateBrowsing', 'private browsing')}
            </a>
            {t('feature', ' feature.')}
        </p>
        <Button color="secondary" onClick={clearRenewPath} href={target}>{t('continue', 'Continue')}</Button>
    </Container>;
};
